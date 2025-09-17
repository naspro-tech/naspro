// /api/checkout.js
import crypto from 'crypto';

function formatDateTime(date = new Date()) {
  // Format date as YYYYMMDDHHMMSS (no separators)
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function generateJazzCashHash(params, password) {
  // As per JazzCash wallet payment hash string spec
  const hashString = [
    password,
    params.pp_Amount,
    params.pp_BillReference,
    params.pp_Description,
    params.pp_Language,
    params.pp_MerchantID,
    password,
    params.pp_ReturnURL,
    params.pp_SubMerchantID || '',
    params.pp_TxnCurrency,
    params.pp_TxnDateTime,
    params.pp_TxnRefNo,
    params.pp_TxnType,
  ].join('&');

  return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { service_key, name, email, phone, description } = req.body;

  if (!service_key || !name || !email || !phone || !description) {
    return res.status(400).json({ error: 'Missing required form data' });
  }

  const servicePrices = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const amountPKR = servicePrices[service_key];
  if (amountPKR === undefined || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  // Convert to paisa (amount * 100)
  const amount = (amountPKR * 100).toString();

  const merchantId = 'MC302132'; // Your Merchant ID
  const password = '53v2z2u302'; // Your Integrity Salt / Password
  const returnUrl = 'https://naspropvt.vercel.app/api/thankyou'; // Your return URL

  if (!merchantId || !password || !returnUrl) {
    return res.status(500).json({ error: 'Merchant credentials not configured' });
  }

  const txnRefNo = 'T' + Date.now();
  const txnDateTime = formatDateTime();

  // Optional expiry: 3 days later (not mandatory but recommended)
  const expiryDateTime = formatDateTime(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  const postData = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',  // <-- Wallet payment
    pp_Language: 'EN',
    pp_MerchantID: merchantId,
    pp_SubMerchantID: '',
    pp_BankID: '',
    pp_ProductID: '',
    pp_TxnRefNo: txnRefNo,
    pp_Amount: amount,
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: 'BillRef' + txnRefNo,
    pp_Description: `Payment for ${service_key}`,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: returnUrl,
    ppmpf_1: name,
    ppmpf_2: email,
    ppmpf_3: phone,
    ppmpf_4: service_key,
    ppmpf_5: description,
  };

  postData.pp_SecureHash = generateJazzCashHash(postData, password);

  const jazzCashLiveUrl =
    'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

  const inputs = Object.entries(postData)
    .map(([key, val]) => `<input type="hidden" name="${key}" value="${val}" />`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
  <head><title>Redirecting to JazzCash...</title></head>
  <body onload="document.forms[0].submit()">
    <p>Redirecting to payment, please wait...</p>
    <form method="POST" action="${jazzCashLiveUrl}">
      ${inputs}
      <noscript><button type="submit">Click here if not redirected</button></noscript>
    </form>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
