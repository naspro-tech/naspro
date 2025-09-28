// /api/ipn.js - JazzCash IPN Handler (MWallet REST API v2.0)
import { createHmac } from "crypto";

function createJazzCashHash(params, integritySalt) {
  // Include only pp_ fields with non-empty values, exclude pp_SecureHash
  const keys = Object.keys(params)
    .filter(
      k => k.startsWith("pp_") &&
           k !== "pp_SecureHash" &&
           params[k] !== undefined &&
           params[k] !== null &&
           params[k] !== ""
    )
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // alphabetical, case-insensitive

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  // Masked log
  console.log("🔑 IPN Hash string (masked):", hashString.replace(integritySalt, "***"));

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!integritySalt) {
      return res.status(500).json({ message: "Missing JazzCash integrity salt." });
    }

    const receivedHash = data.pp_SecureHash;
    const generatedHash = createJazzCashHash(data, integritySalt);

    if (receivedHash !== generatedHash) {
      console.error("❌ IPN Secure Hash Mismatch");
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    // Extract key transaction details
    const {
      pp_TxnRefNo,
      pp_ResponseCode,
      pp_ResponseMessage,
      pp_Amount,
      pp_RetreivalReferenceNo,
    } = data;

    const success = pp_ResponseCode === "000" || pp_ResponseCode === "121";
    const amountRupees = (parseInt(pp_Amount, 10) / 100).toFixed(2);

    console.log(
      `📩 IPN: Ref=${pp_TxnRefNo}, Code=${pp_ResponseCode}, Msg=${pp_ResponseMessage}, Amt=${amountRupees}`
    );

    // Respond quickly to JazzCash to acknowledge receipt
    return res.status(200).json({
      success,
      message: "IPN processed",
      transactionStatus: success ? "success" : "failed",
      transactionId: pp_TxnRefNo,
      amount: amountRupees,
      retrievalReferenceNo: pp_RetreivalReferenceNo,
    });
  } catch (error) {
    console.error("IPN API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
