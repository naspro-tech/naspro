// /api/thankyou.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
  if (!INTEGRITY_SALT) {
    return res.status(500).send("Payment credentials not configured");
  }

  const params = req.body;

  // Extract JazzCash provided hash
  const receivedHash = params.pp_SecureHash;
  if (!receivedHash) {
    return res.status(400).send("Secure hash missing in response");
  }

  // ✅ Build string (Salt + sorted values)
  // CRITICAL FIX: Do NOT filter out empty string values.
  const keys = Object.keys(params)
    .filter((k) => k !== "pp_SecureHash")
    .sort();

  let hashString = INTEGRITY_SALT;
  keys.forEach((key) => {
    hashString += "&" + params[key];
  });

  // ✅ Compute hash using HMAC-SHA256
  const computedHash = crypto
    .createHmac("sha256", INTEGRITY_SALT)
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  // ✅ Verify
  const isValid = computedHash === receivedHash.toUpperCase();
  const success = isValid && params.pp_ResponseCode === "000";

  // Debug log
  console.log("JazzCash Response Payload:", params);
  console.log("Hash String Used:", hashString);
  console.log("Computed Hash:", computedHash);
  console.log("Received Hash:", receivedHash);

  // HTML Response
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Payment ${success ? "Success" : "Failed"}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        .container { max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .success { color: green; }
        .fail { color: red; }
        pre { text-align: left; background: #eee; padding: 10px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="${success ? "success" : "fail"}">
          Payment ${success ? "Successful!" : "Failed"}
        </h1>
        <p>Transaction Ref: ${params.pp_TxnRefNo || "N/A"}</p>
        <p>Response Code: ${params.pp_ResponseCode || "N/A"}</p>
        <p>Message: ${params.pp_ResponseMessage || "N/A"}</p>
        <h3>Debug Info</h3>
        <pre>Computed Hash: ${computedHash}\nReceived Hash: ${receivedHash}\nValid: ${isValid}</pre>
      </div>
    </body>
  </html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
