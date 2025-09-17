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

  // Ensure CNIC is 13 digits
  if (!/^\d{13}$/.test(cnic)) {
    return res.status(400).json({ error: "CNIC must be 13 digits" });
  }

  const cnicLast6 = cnic.slice(-6); // only last 6 digits

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

  // JazzCash credentials from env
  const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
  const PASSWORD = process.env.JAZZCASH_PASSWORD;
  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
  const RETURN_URL = process.env.JAZZCASH_RETURN_URL;

  const txnRefNo = "T" + Date.now();
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +24h

  // Payload with only required fields
  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: MERCHANT_ID,
    pp_Password: PASSWORD,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(amount * 100), // paisa
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

  console.log("DEBUG HASH STRING:", buildHashString(payload, INTEGRITY_SALT));
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

// Format date as YYYYMMDDHHMMSS
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

// Build hash string for debug purposes
function buildHashString(data, salt) {
  const keys = Object.keys(data).filter((k) => k !== "pp_SecureHash").sort();
  let str = "";
  keys.forEach((k) => {
    str += k + "=" + data[k] + "&";
  });
  str += "pp_SecureHashSecret=" + salt;
  return str;
}

// Generate SHA256 hash (uppercase) - plain SHA256, not HMAC
function generateSecureHash(data, salt) {
  const hashString = buildHashString(data, salt);
  return crypto.createHash("sha256").update(hashString).digest("hex").toUpperCase();
}
