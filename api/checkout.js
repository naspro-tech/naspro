// /api/checkout.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { service_key, name, email, phone, description, cnic } = req.body;

  // Basic validation
  if (!service_key || !name || !email || !phone || !cnic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const servicePrices = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000
  };

  const amountPKR = servicePrices[service_key];
  if (!amountPKR || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  const merchantId    = "MC302132";
  const password      = "53v2z2u302";
  const integritySalt = "z60gb5u008";  // Also used as the key in HMAC
  const txnRefNo      = 'T' + Date.now();
  const now           = new Date();
  const txnDateTime   = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +1 day

  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(amountPKR * 100),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_BillReference: txnRefNo,  // Keep it simple and short
    pp_Description: description || "No description provided",
    pp_CNIC: cnic,
    pp_MobileNumber: phone,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: ""
  };

  const secureHash = generateSecureHash(payload, integritySalt);
  payload.pp_SecureHash = secureHash;

  try {
    const response = await fetch('https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return res.status(200).json(result);
  } catch (err) {
    console.error('JazzCash Request Error:', err);
    return res.status(500).json({ error: 'Request to JazzCash failed.' });
  }
}

// Format: YYYYMMDDHHMMSS
function formatDate(date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

// Generate HMAC-SHA256 Hash
function generateSecureHash(payload, integritySalt) {
  const sorted = Object.entries(payload)
    .filter(([key, val]) => key.startsWith("pp_") && val !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => val)
    .join("&");

  const stringToHash = `${integritySalt}&${sorted}`;
  return crypto.createHmac("sha256", integritySalt).update(stringToHash).digest("hex").toUpperCase();
}
