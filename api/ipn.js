// /api/ipn.js
import crypto from "crypto";

function createIpnHash(params, integritySalt) {
  const sortedKeys = Object.keys(params).sort();
  let hashString = integritySalt;
  for (const key of sortedKeys) {
    if (key !== "pp_SecureHash") {
      hashString += "&" + params[key];
    }
  }
  return crypto.createHmac("sha256", integritySalt).update(hashString).digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const responseData = req.body;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    const receivedHash = responseData.pp_SecureHash;
    const generatedHash = createIpnHash(responseData, integritySalt);

    if (receivedHash !== generatedHash) {
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    const { pp_ResponseCode, pp_ResponseMessage, pp_TxnRefNo, pp_Amount, pp_CNIC, pp_MobileNumber } = responseData;

    const amountInRupees = (parseInt(pp_Amount) / 100).toFixed(2);

    console.log("✅ JazzCash IPN Received:", {
      transactionId: pp_TxnRefNo,
      message: pp_ResponseMessage,
      responseCode: pp_ResponseCode,
      amount: amountInRupees,
      cnic: pp_CNIC || null,
      mobile: pp_MobileNumber || null,
    });

    return res.status(200).json({ message: "IPN received" });
  } catch (error) {
    console.error("IPN API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
