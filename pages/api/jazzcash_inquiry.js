// /pages/api/jazzcash_inquiry.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { txnRefNo } = req.body;

  // JazzCash credentials
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const salt = "z60gb5u008";

  // Build payload
  const payload = {
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_SecureHash: ""
  };

  try {
    // Remove pp_SecureHash before hash calculation
    const hashData = { ...payload };
    delete hashData.pp_SecureHash;

    // Remove empty fields
    Object.keys(hashData).forEach((key) => {
      if (hashData[key] === "") delete hashData[key];
    });

    // Sort keys alphabetically
    const sortedKeys = Object.keys(hashData).sort();
    const hashValues = sortedKeys.map((key) => hashData[key]);

    // Build hash string (prepend salt)
    const hashString = salt + "&" + hashValues.join("&");

    // Generate secure hash
    const secureHash = crypto
      .createHmac("sha256", salt)
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    payload.pp_SecureHash = secureHash;

    console.log("JazzCash Inquiry Payload:", payload);
    console.log("Hash String:", hashString);
    console.log("Generated Hash:", secureHash);

    // Call JazzCash Inquiry API
    const response = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log("Status Inquiry Response:", data);

    res.status(200).json({
      success: true,
      request: payload,
      response: data,
    });
  } catch (error) {
    console.error("JazzCash Inquiry error:", error.message);
    res.status(500).json({ success: false, error: "Failed to check status" });
  }
}
  
