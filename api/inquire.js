// /pages/api/inquire.js
import crypto from "crypto";

function createInquiryHash(params, integritySalt) {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort();

  let hashString = integritySalt;
  for (const key of sortedKeys) {
    if (key !== "pp_SecureHash") {
      hashString += "&" + params[key];
    }
  }

  const hmac = crypto.createHmac("sha256", integritySalt);
  hmac.update(hashString);
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { txnRefNo } = req.body;

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!merchantID || !password || !integritySalt) {
      return res
        .status(500)
        .json({ message: "Missing JazzCash environment variables." });
    }

    const payload = {
      pp_Version: "1.1", // ✅ use 1.1 (not 2.0)
      pp_TxnType: "INQUIRY",
      pp_Language: "EN",
      pp_MerchantID: merchantID,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_RetreivalReferenceNo: "", // optional
      pp_SecureHash: "",
    };

    // Generate hash
    payload.pp_SecureHash = createInquiryHash(payload, integritySalt);

    // Call JazzCash Inquiry API
    const apiResponse = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await apiResponse.json();

    return res.status(200).json({
      success: true,
      sentPayload: payload,
      apiResponse: result,
    });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
