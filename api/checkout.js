// /api/checkout.js

import crypto from 'crypto';

export default async function handler(req, res) {
  console.log('--- /api/checkout called ---');
  try {
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { service_key, name, email, phone, description, cnic } = req.body || {};

    console.log('Received body:', { service_key, name, email, phone, description, cnic });

    if (!service_key || !name || !email || !phone || !cnic) {
      console.log('Missing fields');
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
      console.log('Invalid price for service_key:', service_key, 'price:', amountPKR);
      return res.status(400).json({ error: 'Invalid or zero-price service selected' });
    }

    const merchantId = 'MC302132';
    const password = '53v2z2u302';
    const integritySalt = 'z60gb5u008';
    // Not using returnUrl here for REST request

    const txnRefNo = 'T' + Date.now();
    const now = new Date();
    const txnDateTime = formatDate(now);
    const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +1 day

    const payload = {
      pp_Version: '2.0',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: String(amountPKR * 100),
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: `BillRef${txnRefNo}`,
      pp_Description: description || 'Service Payment',
      pp_CNIC: cnic,
      pp_MobileNumber: phone,
      ppmpf_1: name,
      ppmpf_2: email,
      ppmpf_3: service_key,
      ppmpf_4: '',
      ppmpf_5: ''
    };

    const secureHash = generateSecureHash(payload, integritySalt);
    payload.pp_SecureHash = secureHash;

    console.log('Payload to send:', payload);

    // Send to JazzCash
    const response = await fetch('https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 10000 // optional, if your fetch supports timeout
    });

    console.log('JazzCash response status:', response.status);

    const result = await response.json();
    console.log('JazzCash result:', result);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in /api/checkout:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

function formatDate(date) {
  // Convert to PKT timezone (UTC+5)
  const offsetMinutes = 5 * 60; // PKT = UTC +5
  const local = new Date(date.getTime() + (offsetMinutes + date.getTimezoneOffset()) * 60000);

  const YYYY = local.getFullYear();
  const MM = String(local.getMonth() + 1).padStart(2, '0');
  const DD = String(local.getDate()).padStart(2, '0');
  const HH = String(local.getHours()).padStart(2, '0');
  const mm = String(local.getMinutes()).padStart(2, '0');
  const SS = String(local.getSeconds()).padStart(2, '0');

  return `${YYYY}${MM}${DD}${HH}${mm}${SS}`;
}

function generateSecureHash(data, salt) {
  const filtered = Object.entries(data)
    .filter(([k, v]) => k.startsWith('pp_') && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .join('&');

  const stringToHash = `${salt}&${filtered}`;
  console.log('String to hash:', stringToHash);

  const hash = crypto.createHmac('sha256', salt).update(stringToHash).digest('hex').toUpperCase();
  console.log('Generated hash:', hash);
  return hash;
}
