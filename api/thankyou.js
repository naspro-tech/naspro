// /api/thankyou.js
import crypto from "crypto";

function createThankYouHash(params, integritySalt) {
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
    const generatedHash = createThankYouHash(responseData, integritySalt);

    if (receivedHash !== generatedHash) {
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    const { pp_ResponseCode, pp_ResponseMessage, pp_TxnRefNo, pp_Amount, pp_RetreivalReferenceNo, pp_CNIC, pp_MobileNumber } = responseData;

    const amountInRupees = (parseInt(pp_Amount) / 100).toFixed(2);

    return res.status(200).json({
      success: pp_ResponseCode === "000",
      message: pp_ResponseMessage,
      transactionId: pp_TxnRefNo,
      retrievalReferenceNo: pp_RetreivalReferenceNo,
      amount: amountInRupees,
      cnic: pp_CNIC || null,
      mobile: pp_MobileNumber || null,
      transactionDetails: responseData,
    });
  } catch (error) {
    console.error("Thank You API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
