// /api/checkout.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { service_key, name, email, phone, description, cnic } = req.body || {};

    console.log('Checkout request:', { service_key, name, email, phone, description, cnic });

    if (!service_key || !name || !email || !phone || !description || !cnic) {
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

    const merchantId = 'MC152724';
    const password = '00v8sc695t';
    const integritySalt = '221sb04w9x';  // Salt / shared key
    const returnurl = "https://naspro.vercel.app/api/thankyou";  // Public callback URL
    
    const txnRefNo = 'TX' + Date.now();  // prefix to ensure it starts with letter
    const now = new Date();
    const txnDateTime = formatPktDate(now);
    const expiryDateTime = formatPktDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +1 day
    
    // Build bill reference: prefix + unique timestamp / microseconds
    const billReference = `BR${txnRefNo.slice(-12)}`;  // e.g. BR + last 12 digits

    const payload = {
      pp_Version: '2.0',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: String(amountPKR * 100),  // in paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: billReference,
      pp_Description: description,
      pp_CNIC: cnic,
      pp_MobileNumber: phone,
      pp_ReturnURL: returnUrl, // Include Return URL
      ppmpf_1: name,
      ppmpf_2: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''),  // safe alphanumeric
      ppmpf_3: service_key,
      ppmpf_4: '',
      ppmpf_5: ''
    };

    // generate hash
    const secureHash = generateSecureHash(payload, integritySalt);
    payload.pp_SecureHash = secureHash;

    console.log('Payload going to JazzCash:', payload);

    const response = await fetch('https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('JazzCash response status:', response.status);

    const result = await response.json();
    console.log('JazzCash response body:', result);

    res.status(200).json(result);
  } catch (err) {
    console.error('Error in checkout API:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}

function formatPktDate(date) {
  // convert to PKT (UTC+5)
  const offset = 5 * 60; // in minutes
  const localDate = new Date(date.getTime() + (offset + date.getTimezoneOffset()) * 60000);
  const YYYY = localDate.getFullYear();
  const MM = String(localDate.getMonth() + 1).padStart(2, '0');
  const DD = String(localDate.getDate()).padStart(2, '0');
  const HH = String(localDate.getHours()).padStart(2, '0');
  const mm = String(localDate.getMinutes()).padStart(2, '0');
  const ss = String(localDate.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

function generateSecureHash(data, salt) {
  const filtered = Object.entries(data)
    .filter(([k, v]) => k.startsWith('pp_') && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .join('&');

  const stringToHash = `${salt}&${filtered}`;
  console.log('String to hash:', stringToHash);

  const hash = crypto.createHmac('sha256', salt)
    .update(stringToHash)
    .digest('hex')
    .toUpperCase();

  console.log('Generated secureHash:', hash);
  return hash;
}
