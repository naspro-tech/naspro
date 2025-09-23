// /api/inquire.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { txnRefNo } = req.body;
  if (!txnRefNo) {
    return res.status(400).json({ error: "Missing txnRefNo" });
  }

  const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
  const PASSWORD = process.env.JAZZCASH_PASSWORD;
  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
  const BASE_URL = process.env.JAZZCASH_BASE_URL || "https://sandbox.jazzcash.com.pk";

  const payload = {
    pp_TxnRefNo: txnRefNo,
    pp_MerchantID: MERCHANT_ID,
    pp_Password: PASSWORD,
  };

  payload.pp_SecureHash = generateSecureHash(payload, INTEGRITY_SALT);

  try {
    const response = await fetch(
      `${BASE_URL}/ApplicationAPI/API/PaymentInquiry/Inquire`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return res.status(200).json({ sentPayload: payload, apiResponse: result });
  } catch (err) {
    console.error("JazzCash Inquiry API Error:", err.message);
    return res.status(500).json({ error: "Inquiry request failed. " + err.message });
  }
}

function buildHashString(data) {
  return Object.keys(data)
    .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash" && data[k] !== "")
    .sort()
    .map((k) => data[k])
    .join("&");
}

function generateSecureHash(data, salt) {
  const hashString = salt + "&" + buildHashString(data);
  return crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();
}
