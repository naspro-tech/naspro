// /api/thankyou.js - JazzCash ThankYou Handler (fixed lowercase fields + hash validation)
import crypto from "crypto";

function createJazzCashHash(params, integritySalt) {
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== "")
    .sort();

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  const hmac = crypto.createHmac("sha256", integritySalt);
  hmac.update(hashString);
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const responseData = req.method === "POST" ? req.body : req.query;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!integritySalt) {
      return res.status(500).json({ message: "Missing JazzCash integrity salt." });
    }

    const receivedHash = responseData.pp_SecureHash;
    const generatedHash = createJazzCashHash(responseData, integritySalt);

    if (receivedHash !== generatedHash) {
      console.error("❌ ThankYou Secure Hash Mismatch");
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    const { pp_responseCode, pp_responseMessage, pp_txnRefNo, pp_amount, pp_retreivalReferenceNo } = responseData;
    const success = pp_responseCode === "000" || pp_responseCode === "121";
    const amountRupees = (parseInt(pp_amount, 10) / 100).toFixed(2);

    return res.status(200).json({
      success,
      message: pp_responseMessage,
      transactionId: pp_txnRefNo,
      retrievalReferenceNo: pp_retreivalReferenceNo,
      amount: amountRupees,
      transactionDetails: responseData,
    });
  } catch (error) {
    console.error("ThankYou API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
