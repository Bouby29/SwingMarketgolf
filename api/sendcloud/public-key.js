/**
 * Sendcloud Public Key Endpoint
 * 
 * Purpose: Expose the Sendcloud public key to frontend clients for API authentication.
 * This endpoint returns ONLY the public key (not the secret key, which remains secure on the backend).
 * 
 * Method: GET only
 * Response: { public_key: string }
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers to allow frontend requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;

  if (!publicKey) {
    console.error("SENDCLOUD_PUBLIC_KEY environment variable not set");
    return res.status(500).json({ 
      error: "Sendcloud public key not configured",
      message: "The server is missing SENDCLOUD_PUBLIC_KEY environment variable"
    });
  }

  res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
  return res.status(200).json({ public_key: publicKey });
}
