// /api/checkout.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { service_key, name, email, phone, description = "Test Payment", cnic } = req.body;

  if (!service_key || !name || !email || !phone || !cnic) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^\d{13}$/.test(cnic)) {
    return res.status(400).json({ error: "CNIC must be 13 digits" });
  }
  const cnicLast6 = cnic.slice(-6);

  const SERVICE_PRICES = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const amount = SERVICE_PRICES[service_key];
  if (!amount || amount === 0) {
    return res.status(400).json({ error: "Invalid or zero-price service selected" });
  }

  const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
  const PASSWORD = process.env.JAZZCASH_PASSWORD;
  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
  const RETURN_URL = process.env.JAZZCASH_RETURN_URL;

  const txnRefNo = "T" + Date.now();
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: MERCHANT_ID,
    pp_Password: PASSWORD,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(amount * 100),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_BillReference: "BillRef",
    pp_Description: description,
    pp_CNIC: cnicLast6,
    pp_MobileNumber: phone,
    pp_ReturnURL: RETURN_URL,
  };

  // Generate secure hash
  payload.pp_SecureHash = generateSecureHash(payload, INTEGRITY_SALT);

  console.log("HASH STRING:", buildHashString(payload));
  console.log("FINAL HASH:", payload.pp_SecureHash);

  try {
    const response = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return res.status(200).json({ sentPayload: payload, apiResponse: result });
  } catch (err) {
    console.error("JazzCash API Error:", err);
    return res.status(500).json({ error: "Payment request failed. Please try again later." });
  }
}

function formatDate(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

// Build hash string (values only, sorted by key)
function buildHashString(data) {
  return Object.keys(data)
    .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash" && data[k] !== "")
    .sort()
    .map((k) => data[k])
    .join("&");
}

// Generate HMAC-SHA256
function generateSecureHash(data, salt) {
  const hashString = salt + "&" + buildHashString(data);
  return crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();
}
