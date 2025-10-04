import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const responseData = req.body;

  // JazzCash sandbox salt (hardcoded for now)
  const salt = "z60gb5u008";

  try {
    // Extract received hash
    const receivedHash = responseData.pp_SecureHash;

    // Prepare data for hash verification
    const verifyData = { ...responseData };
    delete verifyData.pp_SecureHash;

    Object.keys(verifyData).forEach((key) => {
      if (verifyData[key] === "") delete verifyData[key];
    });

    const sortedKeys = Object.keys(verifyData).sort();
    const hashValues = sortedKeys.map((key) => verifyData[key]);
    const hashString = salt + "&" + hashValues.join("&");

    const calculatedHash = crypto
      .createHmac("sha256", salt)
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    if (receivedHash !== calculatedHash) {
      return res.status(400).json({
        success: false,
        error: "Hash verification failed",
        responseData,
      });
    }

    // Extract payment info
    const transaction_id = responseData.pp_TxnRefNo || "";
    const bankTransactionId = responseData.pp_RetreivalReferenceNo || "";
    const amount = responseData.pp_Amount
      ? parseInt(responseData.pp_Amount) / 100
      : 0;

    const success = responseData.pp_ResponseCode === "000";

    // Optional: Insert into database here
    // await saveToDatabase({ transaction_id, amount, success, responseData });

    return res.status(200).json({
      success,
      orderId: transaction_id,
      transaction_id,
      amount,
      responseCode: responseData.pp_ResponseCode,
      responseMessage:
        responseData.pp_ResponseMessage || (success ? "Payment successful" : "Payment failed"),
      payment_method: "JazzCash",
      bankTransactionId,
    });
  } catch (error) {
    console.error("Error processing JazzCash response:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
