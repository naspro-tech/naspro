import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const responseData = req.body;
  const salt = "z60gb5u008"; // Sandbox salt

  console.log("🎯 JazzCash Response Received:", responseData);

  try {
    // Extract and remove hash for verification
    const receivedHash = responseData.pp_SecureHash;
    const verifyData = { ...responseData };
    delete verifyData.pp_SecureHash;

    // Remove any empty fields
    Object.keys(verifyData).forEach((key) => {
      if (verifyData[key] === "") delete verifyData[key];
    });

    // Sort and join for hash validation
    const sortedKeys = Object.keys(verifyData).sort();
    const hashValues = sortedKeys.map((key) => verifyData[key]);
    const hashString = salt + "&" + hashValues.join("&");

    const calculatedHash = crypto
      .createHmac("sha256", salt)
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    console.log("🔐 JazzCash Hash Verification");
    console.log("Received Hash:", receivedHash);
    console.log("Calculated Hash:", calculatedHash);

    // Compare hashes
    if (receivedHash === calculatedHash && responseData.pp_ResponseCode === "000") {
      // ✅ Verified payment
      const result = {
        success: true,
        orderId: responseData.pp_TxnRefNo,
        transaction_id:
          responseData.pp_RetreivalReferenceNo || responseData.pp_TxnRefNo,
        amount: (responseData.pp_Amount / 100).toString(),
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: "JazzCash",
        bankTransactionId: responseData.pp_RetreivalReferenceNo || "",
      };

      console.log("✅ JazzCash Payment Verified:", result);

      // Redirect user back to thank-you page with success params
      const redirectUrl = `https://naspropvt.vercel.app/thankyou?${new URLSearchParams(
        result
      ).toString()}`;
      return res.redirect(302, redirectUrl);
    } else {
      // ❌ Failed or unverified payment
      console.error("❌ JazzCash Payment Verification Failed");
      const redirectUrl = `https://naspropvt.vercel.app/thankyou?success=false&error=${
        responseData.pp_ResponseMessage || "Payment verification failed"
      }`;
      return res.redirect(302, redirectUrl);
    }
  } catch (error) {
    console.error("⚠️ JazzCash response processing error:", error.message);
    const redirectUrl = `https://naspropvt.vercel.app/thankyou?success=false&error=Payment processing error`;
    return res.redirect(302, redirectUrl);
  }
}
