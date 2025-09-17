// /api/checkout.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { service_key, name, email, phone, description, cnic } = req.body;

  if (!service_key || !name || !email || !phone || !description || !cnic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Pricing
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

  const merchantId     = "MC302132";          // Your test Merchant ID
  const password       = "53v2z2u302";        // Password from JazzCash Sandbox
  const integritySalt  = "z60gb5u008";        // Integrity Salt = HASH KEY
  const returnUrl      = "https://naspropvt.vercel.app/api/thankyou"; // Not used in REST, but keep for record

  // Timestamps
  const txnRefNo       = 'T' + Date.now();
  const now            = new Date();
  const txnDateTime    = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +1 day

  // Prepare data payload
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
    pp_BillReference: "BillRef",
    pp_Description: description,
    pp_CNIC: cnic,
    pp_MobileNumber: phone,
    ppmpf_1: name,
    ppmpf_2: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''), // email username only, alphanumeric
    ppmpf_3: service_key,
    ppmpf_4: "",
    ppmpf_5: ""
  };

  // Generate secure hash
  const hash = generateSecureHash(payload, integritySalt);
  payload.pp_SecureHash = hash;

  try {
    // Send POST request to JazzCash REST API
    const response = await fetch('https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // Return result to frontend
    res.status(200).json(result);
  } catch (error) {
    console.error('JazzCash API call failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Format date in YYYYMMDDHHMMSS
function formatDate(date) {
  return date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
}

// Generate JazzCash secure hash (HMAC-SHA256)
function generateSecureHash(data, salt) {
  const filtered = Object.entries(data)
    .filter(([k, v]) => k.startsWith('pp_') && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .join('&');

  const stringToHash = `${salt}&${filtered}`;
  return crypto.createHmac('sha256', salt).update(stringToHash).digest('hex').toUpperCase();
}
