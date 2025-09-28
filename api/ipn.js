// /api/ipn.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2"; // Replace with your salt

function createJazzCashHash(params, salt) {
  const keys = Object.keys(params)
    .filter(
      (k) =>
        k.startsWith("pp_") &&
        k !== "pp_SecureHash" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== ""
    )
    .sort();

  const valuesString = keys.map((k) => params[k]).join("&");
  const hashString = `${salt}&${valuesString}`;

  const hmac = createHmac("sha256", salt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const response = req.body; // JazzCash will POST here

    // Validate SecureHash
    const expectedHash = createJazzCashHash(response, INTEGRITY_SALT);
    if (response.pp_SecureHash !== expectedHash) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid secure hash" });
    }

    // Check payment response
    if (response.pp_ResponseCode === "000") {
      // Success
      console.log("✅ Payment successful:", response);
      // TODO: Save order in DB, send email, etc.
      return res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      // Failed
      console.log("❌ Payment failed:", response);
      return res
        .status(200)
        .json({ success: false, message: response.pp_ResponseMessage });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
