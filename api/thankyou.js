// /api/thankyou.js - JazzCash ThankYou Handler (MWallet REST API v2.0)
import { createHmac } from "crypto";

function createJazzCashHash(params, integritySalt) {
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.method === "POST" ? req.body : req.query;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!integritySalt) return res.status(500).json({ message: "Missing JazzCash integrity salt." });

    const receivedHash = data.pp_SecureHash;
    const generatedHash = createJazzCashHash(data, integritySalt);

    if (receivedHash !== generatedHash) {
      console.error("❌ ThankYou Secure Hash Mismatch");
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    const success = data.pp_ResponseCode === "000" || data.pp_ResponseCode === "121";
    const amountRupees = (parseInt(data.pp_Amount, 10) / 100).toFixed(2);

    return res.status(200).json({
      success,
      message: data.pp_ResponseMessage,
      transactionId: data.pp_TxnRefNo,
      retrievalReferenceNo: data.pp_RetreivalReferenceNo,
      amount: amountRupees,
      transactionDetails: data,
    });
  } catch (error) {
    console.error("ThankYou API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
