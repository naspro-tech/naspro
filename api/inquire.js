// /api/inquire.js - JazzCash Inquiry (fixed lowercase fields + correct endpoint)
import crypto from "crypto";

function createJazzCashHash(params, integritySalt) {
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== "")
    .sort();

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

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
      return res.status(500).json({ message: "Missing JazzCash environment variables." });
    }

    const payload = {
      pp_version: "2.0",
      pp_txnType: "INQUIRY",
      pp_merchantID: merchantID,
      pp_password: password,
      pp_txnRefNo: txnRefNo,
      pp_retreivalReferenceNo: "",
    };

    payload.pp_SecureHash = createJazzCashHash(payload, integritySalt);

    const formData = new URLSearchParams();
    for (const key in payload) {
      formData.append(key, payload[key] ?? "");
    }

    const endpoint = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire";
    // for live: "https://payment.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire"

    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    const result = await apiResponse.json();

    return res.status(200).json({ success: true, payload, jazzCashResponse: result });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
