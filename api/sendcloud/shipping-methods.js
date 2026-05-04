/**
 * Sendcloud Shipping Methods Proxy Endpoint
 * 
 * Purpose: Proxy requests to Sendcloud API to fetch available shipping methods.
 * This endpoint handles authentication securely on the backend and returns the methods
 * to the frontend. Query parameters are forwarded to Sendcloud.
 * 
 * Method: GET only
 * Query params (optional): sender_address, to_country, etc. (forwarded to Sendcloud)
 * Response: { shipping_methods: [...] } (from Sendcloud API)
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    console.error("Missing Sendcloud credentials: SENDCLOUD_PUBLIC_KEY or SENDCLOUD_SECRET_KEY");
    return res.status(500).json({ 
      error: "Sendcloud credentials not configured",
      message: "The server is missing Sendcloud environment variables"
    });
  }

  try {
    // Build Basic Auth header for Sendcloud API
    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    // Build URL with query parameters
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://panel.sendcloud.sc/api/v2/shipping_methods${queryString ? `?${queryString}` : ""}`;

    // Fetch shipping methods from Sendcloud
    const sendcloudRes = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const sendcloudData = await sendcloudRes.json();

    // If Sendcloud returned an error, forward it
    if (!sendcloudRes.ok) {
      console.error("Sendcloud API error:", sendcloudRes.status, sendcloudData);
      return res.status(sendcloudRes.status).json({
        error: "Sendcloud API error",
        details: sendcloudData,
      });
    }

    // Set cache headers for short duration
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

    // Return Sendcloud response as-is
    return res.status(200).json(sendcloudData);
  } catch (error) {
    console.error("Error fetching shipping methods from Sendcloud:", error);
    return res.status(500).json({ 
      error: "Failed to fetch shipping methods",
      message: error.message || "Unknown error"
    });
  }
}
