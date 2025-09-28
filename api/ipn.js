// /api/ipn.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2"; // replace with your JazzCash salt

function createJazzCashHash(params, integritySalt) {
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
  const hashString = `${integritySalt}&${valuesString}`;

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const data = req.body;

    // Step 1: Extract received hash
    const receivedHash = data.pp_SecureHash;

    // Step 2: Recalculate hash from received params
    const calculatedHash = createJazzCashHash(data, INTEGRITY_SALT);

    if (receivedHash !== calculatedHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid Secure Hash",
      });
    }

    // Step 3: Check JazzCash response code
    if (data.pp_ResponseCode === "000") {
      // Payment success
      console.log("✅ Payment Success:", data);

      // You can save transaction to DB here
      // e.g. mark order as PAID

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // Payment failed
      console.log("❌ Payment Failed:", data);

      return res.status(200).json({
        success: false,
        message: `Payment failed: ${data.pp_ResponseMessage}`,
      });
    }
  } catch (error) {
    console.error("IPN Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
