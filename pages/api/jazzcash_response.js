// /pages/api/jazzcash_response.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const responseData = req.body;

  // ------------------ JazzCash sandbox salt ------------------
  const salt = "1g90sz31w2";

  console.log("JazzCash Response Received:", responseData);

  try {
    // ------------------ Verify secure hash ------------------
    const receivedHash = responseData.pp_SecureHash;

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

    console.log("Hash Verification:");
    console.log("Received Hash:", receivedHash);
    console.log("Calculated Hash:", calculatedHash);

    let redirectUrl = "https://naspropvt.vercel.app/thankyou";

    if (receivedHash === calculatedHash) {
      // ✅ Payment verified
      const result = {
        success: responseData.pp_ResponseCode === "000", // 000 = success
        orderId: responseData.pp_TxnRefNo,
        transaction_id: responseData.pp_RetreivalReferenceNo || responseData.pp_TxnRefNo,
        amount: (responseData.pp_Amount / 100).toString(),
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: "JazzCash",
        bankTransactionId: responseData.pp_RetreivalReferenceNo || "",
      };

      console.log("JazzCash Payment Verified:", result);

      redirectUrl += `?${new URLSearchParams(result).toString()}`;
    } else {
      // ❌ Hash mismatch
      console.error("JazzCash Hash verification failed");
      redirectUrl += "?success=false&error=Payment verification failed";
    }

    // Redirect user to thankyou page
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("JazzCash response processing error:", error.message);
    const redirectUrl =
      "https://naspropvt.vercel.app/thankyou?success=false&error=Payment processing error";
    res.redirect(302, redirectUrl);
  }
}
