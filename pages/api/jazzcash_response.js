// /pages/api/jazzcash_response.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const responseData = req.body;
  const salt = "z60gb5u008";

  try {
    const receivedHash = responseData.pp_SecureHash;
    const verifyData = { ...responseData };
    delete verifyData.pp_SecureHash;

    Object.keys(verifyData).forEach(key => { if (verifyData[key] === "") delete verifyData[key]; });

    const sortedKeys = Object.keys(verifyData).sort();
    const hashValues = sortedKeys.map(key => verifyData[key]);
    const hashString = salt + "&" + hashValues.join("&");

    const calculatedHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();

    if (receivedHash === calculatedHash) {
      const result = {
        success: responseData.pp_ResponseCode === "000" ? true : false,
        orderId: responseData.pp_TxnRefNo,
        transaction_id: responseData.pp_RetreivalReferenceNo || responseData.pp_TxnRefNo,
        amount: (responseData.pp_Amount / 100).toString(),
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: "JazzCash",
        bankTransactionId: responseData.pp_RetreivalReferenceNo || "",
      };

      const redirectUrl = `https://naspropvt.vercel.app/thankyou?${new URLSearchParams(result).toString()}`;
      return res.redirect(302, redirectUrl);
    } else {
      const redirectUrl = `https://naspropvt.vercel.app/thankyou?success=false&error=Payment verification failed`;
      return res.redirect(302, redirectUrl);
    }
  } catch (error) {
    const redirectUrl = `https://naspropvt.vercel.app/thankyou?success=false&error=Payment processing error`;
    return res.redirect(302, redirectUrl);
  }
}
