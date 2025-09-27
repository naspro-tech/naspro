// /pages/api/thankyou.js - JazzCash ThankYou Handler (PascalCase fields + hash validation)
import { createHmac } from "crypto";

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

  return createHmac("sha256", integritySalt)
    .update(hashString)
    .digest("hex")
    .toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const responseData = req.method === "POST" ? req.body : req.query;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!integritySalt) {
      return res
        .status(500)
        .json({ message: "Missing JazzCash integrity salt." });
    }

    const receivedHash = responseData.pp_SecureHash;
    const generatedHash = createJazzCashHash(responseData, integritySalt);

    if (receivedHash !== generatedHash) {
      console.error("❌ ThankYou Secure Hash Mismatch");
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    // ✅ Use correct PascalCase field names
    const {
      pp_TxnRefNo,
      pp_ResponseCode,
      pp_ResponseMessage,
      pp_Amount,
      pp_RetreivalReferenceNo,
    } = responseData;

    const success = pp_ResponseCode === "000" || pp_ResponseCode === "121";
    const amountRupees = (parseInt(pp_Amount, 10) / 100).toFixed(2);

    return res.status(200).json({
      success,
      message: pp_ResponseMessage,
      transactionId: pp_TxnRefNo,
      retrievalReferenceNo: pp_RetreivalReferenceNo,
      amount: amountRupees,
      transactionDetails: responseData,
    });
  } catch (error) {
    console.error("T
    
