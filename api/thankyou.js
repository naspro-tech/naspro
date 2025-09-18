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
  const receivedHash = params.pp_SecureHash;

  if (!receivedHash) {
    return res.status(400).send("Secure hash missing in response");
  }

  // Build string for validation
  const sortedString = Object.keys(params)
    .filter((k) => k !== "pp_SecureHash" && params[k] !== "")
    .sort()
    .map((k) => params[k])
    .join("&");

  const hashString = INTEGRITY_SALT + "&" + sortedString;

  // Compute hash
  const computedHash = crypto
    .createHmac("sha256", INTEGRITY_SALT)
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  const isValid = computedHash === receivedHash.toUpperCase();
  const success = isValid && params.pp_ResponseCode === "000";

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
        <p><a href="/">Go back to Home</a></p>
      </div>
    </body>
  </html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
