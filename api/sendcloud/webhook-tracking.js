/**
 * Sendcloud Tracking Webhook Endpoint
 *
 * Purpose: Receive tracking status updates from Sendcloud.
 * Updates shipment status in database based on Sendcloud notifications.
 *
 * Method: POST only
 * Body: Sendcloud webhook payload (JSON)
 * Response: 200 OK (always, to prevent retries)
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers (though webhooks typically don't need CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    // Initialize Supabase with service role
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const payload = req.body;
    console.log("Sendcloud webhook received:", JSON.stringify(payload, null, 2));

    // Handle parcel status changed action
    if (payload.action === "parcel_status_changed" && payload.parcel) {
      const parcel = payload.parcel;
      const parcelId = parcel.id;
      const statusId = parcel.status?.id;
      const statusMessage = parcel.status?.message;

      if (!parcelId || !statusId) {
        console.warn("Invalid webhook payload: missing parcel.id or status.id");
        return res.status(200).json({ received: true });
      }

      // Find shipment by Sendcloud parcel ID
      const { data: shipment, error: findError } = await supabase
        .from("shipments")
        .select("id, status, order_id")
        .eq("sendcloud_parcel_id", parcelId)
        .single();

      if (findError || !shipment) {
        console.warn(`Shipment not found for Sendcloud parcel ${parcelId}`);
        return res.status(200).json({ received: true });
      }

      // Map Sendcloud status ID to our status enum
      let newStatus;
      let updateData = {
        status_message: statusMessage,
        updated_at: new Date().toISOString(),
      };

      // Status mapping based on Sendcloud status IDs
      if (statusId >= 1000 && statusId < 1200) {
        newStatus = "created";
      } else if (statusId >= 1300 && statusId < 1500) {
        newStatus = statusId >= 1400 ? "shipped" : "in_transit";
      } else if (statusId >= 1500 && statusId < 1600) {
        newStatus = "delivered";
        updateData.delivered_at = new Date().toISOString();
      } else if (statusId >= 2000) {
        newStatus = "returned";
      } else {
        console.warn(`Unknown Sendcloud status ID: ${statusId}`);
        newStatus = shipment.status; // Keep current status
      }

      // Idempotency: don't update if status is the same
      if (newStatus === shipment.status) {
        console.log(`Status unchanged for shipment ${shipment.id}: ${newStatus}`);
        return res.status(200).json({ received: true });
      }

      updateData.status = newStatus;

      // Update shipment
      const { error: updateError } = await supabase
        .from("shipments")
        .update(updateData)
        .eq("id", shipment.id);

      if (updateError) {
        console.error("Error updating shipment:", updateError);
        return res.status(500).json({ error: "Failed to update shipment" });
      }

      // If delivered, update order status too
      if (newStatus === "delivered") {
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update({
            status: "delivered",
            updated_at: new Date().toISOString()
          })
          .eq("id", shipment.order_id);

        if (orderUpdateError) {
          console.error("Error updating order status:", orderUpdateError);
        }
      }

      console.log(`Shipment ${shipment.id} updated to status: ${newStatus}`);
    } else {
      console.log(`Unhandled webhook action: ${payload.action}`);
    }

    // Always return 200 to prevent Sendcloud retries
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    // Still return 200 to prevent retries, but log the error
    return res.status(200).json({ received: true, error: error.message });
  }
}