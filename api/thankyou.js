import crypto from "crypto";

export default async function handler(req, res) {
  // Accept both POST (body) and GET (query)
  const params = req.method === "POST" ? req.body : req.query;

  if (!params || Object.keys(params).length === 0) {
    return res.status(400).send("No parameters received");
  }

  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT || "z60gb5u008";
  if (!INTEGRITY_SALT) {
    return res.status(500).send("Payment credentials not configured");
  }

  const receivedHash = params.pp_SecureHash;
  if (!receivedHash) {
    return res.status(400).send("Secure hash missing in response");
  }

  const keys = Object.keys(params).filter((k) => k !== "pp_SecureHash").sort();

  let hashString = INTEGRITY_SALT;
  keys.forEach((key) => {
    hashString += "&" + (params[key] === undefined ? "" : String(params[key]));
  });

  const computedHash = crypto
    .createHmac("sha256", INTEGRITY_SALT)
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  const isValid = computedHash === String(receivedHash).toUpperCase();
  const success = isValid && params.pp_ResponseCode === "000";

  console.log("JazzCash Response Payload:", params);
  console.log("Hash String Used:", hashString);
  console.log("Computed Hash:", computedHash);
  console.log("Received Hash:", receivedHash);

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Payment ${success ? "Success" : "Failed"}</title>
      <meta charset="utf-8" />
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
