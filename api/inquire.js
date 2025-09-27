// /api/inquire.js - JazzCash Inquiry (PascalCase + fixed SecureHash)
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

  // Masked log (never log real salt in production)
  console.log("🔑 Inquiry Hash string (masked):", hashString.replace(integritySalt, "***"));

  // ✅ Generate secure hash (same as CryptoJS style)
  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  const secureHash = hmac.digest("hex").toUpperCase();

  return secureHash;
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

    // ⚡ PascalCase keys as per JazzCash spec
    const payload = {
      pp_Version: "2.0",
      pp_TxnType: "INQUIRY",
      pp_MerchantID: merchantID,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_RetreivalReferenceNo: "",
    };

    // ✅ Generate SecureHash
    const secureHash = createJazzCashHash(payload, integritySalt);
    payload.pp_SecureHash = secureHash;

    const formData = new URLSearchParams();
    for (const key in payload) {
      formData.append(key, payload[key] ?? "");
    }

    const endpoint =
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire";
    // For live: "https://payment.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire"

    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    const result = await apiResponse.json();

    return res
      .status(200)
      .json({ success: true, payload, jazzCashResponse: result });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
