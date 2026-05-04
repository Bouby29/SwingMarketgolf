/**
 * Sendcloud Create Shipment Endpoint
 *
 * Purpose: Create a Sendcloud parcel (bordereau) for a paid order.
 * This endpoint handles the creation of shipping labels and tracking.
 *
 * Method: POST only
 * Body: { order_id: UUID }
 * Response: { shipment: {...} } (201) or { error: string } (400/500)
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ error: "order_id is required" });
  }

  try {
    // Initialize Supabase with service role (bypasses RLS)
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Get the order with related data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        buyer_id,
        seller_id,
        shipping_method_id,
        shipping_address,
        products:product_id (
          id,
          title,
          seller_id,
          seller:seller_id (
            id,
            username,
            stripe_account_business_name
          )
        ),
        buyer:buyer_id (
          id,
          username,
          email,
          phone
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Check order status
    if (order.status !== "paid") {
      return res.status(400).json({ error: "Order not paid" });
    }

    // 3. Check for existing shipment (idempotency)
    const { data: existingShipment } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_id", order_id)
      .eq("status", "created")
      .single();

    if (existingShipment) {
      return res.status(200).json({ shipment: existingShipment });
    }

    // 4. Parse shipping address
    let shippingAddress;
    try {
      shippingAddress = JSON.parse(order.shipping_address);
    } catch (e) {
      console.error("Invalid shipping address JSON:", order.shipping_address);
      return res.status(400).json({ error: "Invalid shipping address" });
    }

    // 5. Get sender name (Phase 1: use Stripe business name or username)
    const seller = order.products?.seller;
    const senderName = seller?.stripe_account_business_name || seller?.username || "Swing Market";

    // 6. Prepare Sendcloud parcel data
    const parcelData = {
      parcel: {
        name: shippingAddress.name || order.buyer?.username || "Client",
        company_name: "",
        address: shippingAddress.street || "",
        house_number: shippingAddress.house_number || "",
        city: shippingAddress.city || "",
        postal_code: shippingAddress.postal_code || "",
        country: "FR",
        telephone: order.buyer?.phone || shippingAddress.phone || "",
        email: order.buyer?.email || "",
        order_number: order.id,
        weight: "1.000", // 1kg default for Phase 1
        request_label: true,
        shipping_method: order.shipping_method_id
      }
    };

    // 7. Call Sendcloud API
    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
      console.error("Missing Sendcloud credentials");
      return res.status(500).json({ error: "Sendcloud configuration error" });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    const sendcloudRes = await fetch("https://panel.sendcloud.sc/api/v2/parcels", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parcelData),
    });

    const sendcloudData = await sendcloudRes.json();

    // 8. Handle Sendcloud response
    if (!sendcloudRes.ok) {
      console.error("Sendcloud API error:", sendcloudRes.status, sendcloudData);

      // Insert error shipment
      const { data: errorShipment, error: insertError } = await supabase
        .from("shipments")
        .insert({
          order_id: order_id,
          status: "error",
          status_message: sendcloudData.message || `Sendcloud error ${sendcloudRes.status}`,
          sendcloud_raw_response: sendcloudData,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting shipment:", insertError);
      }

      return res.status(500).json({
        error: "Failed to create shipment",
        details: sendcloudData.message || "Unknown Sendcloud error"
      });
    }

    // 9. Success: insert shipment and update order
    const parcel = sendcloudData.parcel;

    const shipmentData = {
      order_id: order_id,
      sendcloud_parcel_id: parcel.id,
      tracking_number: parcel.tracking_number,
      tracking_url: parcel.tracking_url,
      label_pdf_url: parcel.label?.label_printer || parcel.label?.normal_printer,
      carrier: parcel.carrier?.code,
      shipping_method_id: parcel.shipping_method_id,
      service_point_id: parcel.service_point?.id,
      service_point_name: parcel.service_point?.name,
      service_point_address: parcel.service_point ? `${parcel.service_point.street} ${parcel.service_point.house_number}, ${parcel.service_point.postal_code} ${parcel.service_point.city}` : null,
      weight_grams: 1000, // 1kg for Phase 1
      shipping_cost_cents: parcel.price || 0,
      status: "created",
      status_message: "Label created successfully",
      sendcloud_raw_response: sendcloudData,
    };

    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .insert(shipmentData)
      .select()
      .single();

    if (shipmentError) {
      console.error("Error inserting shipment:", shipmentError);
      return res.status(500).json({ error: "Failed to save shipment" });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "label_ready" })
      .eq("id", order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      // Don't fail the request for this
    }

    return res.status(201).json({ shipment });

  } catch (error) {
    console.error("Create shipment error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message || "Unknown error"
    });
  }
}