import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
  const params = req.body;

  console.log("=== DEBUG THANKYOU RESPONSE BODY ===");
  console.log(params);

  const receivedHash = params.pp_SecureHash;
  if (!receivedHash) {
    return res.status(400).send("Secure hash missing in response");
  }

  // Build string
  const keys = Object.keys(params).filter((k) => k !== "pp_SecureHash").sort();
  const str = keys.map((k) => params[k]).join("&");

  // Compute HMAC
  const computedHash = crypto.createHmac("sha256", INTEGRITY_SALT).update(str).digest("hex").toUpperCase();

  console.log("Computed Hash:", computedHash);
  console.log("Received Hash:", receivedHash);

  const isValid = computedHash === receivedHash.toUpperCase();
  const success = isValid && params.pp_ResponseCode === "000";

  const html = `<!DOCTYPE html>
  <html>
    <head><title>Payment ${success ? "Success" : "Failed"}</title></head>
    <body>
      <h1>${success ? "✅ Payment Successful" : "❌ Payment Failed"}</h1>
      <pre>${JSON.stringify(params, null, 2)}</pre>
      <p>Computed Hash: ${computedHash}</p>
      <p>Received Hash: ${receivedHash}</p>
    </body>
  </html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
