// /api/checkout.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { service_key, name, email, phone, description = "", cnic } = req.body;

  // Validate
  if (!service_key || !name || !email || !phone || !cnic) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^\d{6}$/.test(cnic)) {
    return res.status(400).json({ error: "CNIC must be exactly 6 digits." });
  }

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

  // JazzCash credentials
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const integritySalt = "z60gb5u008";

  const txnRefNo = "T" + Date.now();
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 60 * 60 * 1000)); // +1 hour
  const returnUrl = "https://naspropvt.vercel.app/api/thankyou";

  // Prepare full payload
  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(amount * 100), // in paisa
    pp_DiscountedAmount: "",
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_BillReference: "BillRef",
    pp_Description: sanitizeDescription(description),
    pp_CNIC: cnic,
    pp_MobileNumber: phone,
    pp_ReturnURL: returnUrl,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  // Generate Secure Hash (PHP-equivalent logic)
  const { hashString, hash } = generateSecureHash(payload, integritySalt);
  payload.pp_SecureHash = hash;

  console.log("DEBUG JazzCash Hash String:", hashString);
  console.log("DEBUG JazzCash Final Hash:", hash);

  // Send JSON request to JazzCash API
  try {
    const response = await fetch(
      "https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return res.status(200).json(result);
  } catch (err) {
    console.error("JazzCash API Error:", err);
    return res.status(500).json({ error: "Payment request failed. Please try again later." });
  }
}

// Format to YYYYMMDDHHMMSS
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

// Sanitize description from illegal characters
function sanitizeDescription(desc) {
  return desc.replace(/[<>\*=%\/:'"|{}]/g, " ").slice(0, 100);
}

// Generate secure hash (translation of PHP version)
function generateSecureHash(data, salt) {
  // 1. Sort keys alphabetically
  const keys = Object.keys(data).sort();

  // 2. Collect only NON-empty values
  const values = [];
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      values.push(data[k]);
    }
  }

  // 3. Prepend salt
  const hashString = salt + "&" + values.join("&");

  // 4. HMAC-SHA256
  const hash = crypto
    .createHmac("sha256", salt)
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  return { hashString, hash };
}
