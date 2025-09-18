import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // 🔹 Sandbox Integrity Salt
  const INTEGRITY_SALT = "z60gb5u008";

  const params = req.body;

  // Secure hash from JazzCash response
  const receivedHash = params.pp_SecureHash;
  if (!receivedHash) {
    return res.status(400).send("Secure hash missing in response");
  }

  // Build string in alphabetical order (excluding pp_SecureHash)
  const keys = Object.keys(params).filter((k) => k !== "pp_SecureHash").sort();
  const str = keys.map((k) => params[k]).join("&");

  // Compute HMAC-SHA256
  const computedHash = crypto
    .createHmac("sha256", INTEGRITY_SALT)
    .update(str)
    .digest("hex")
    .toUpperCase();

  const isValid = computedHash === receivedHash.toUpperCase();
  const success = isValid && params.pp_ResponseCode === "000";

  console.log("=== DEBUG THANKYOU RESPONSE ===");
  console.log("String used for hash:", str);
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
        pre { background: #eee; padding: 10px; text-align: left; font-size: 12px; }
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
        <p>CNIC (Last 6): ${params.pp_CNIC || "N/A"}</p>
        <hr>
        <h3>Debug Info</h3>
        <pre>
String Used: ${str}
Computed: ${computedHash}
Received: ${receivedHash}
Match: ${isValid}
        </pre>
        <p><a href="/">Go back to Home</a></p>
      </div>
    </body>
  </html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
