// /api/checkout.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { service_key, name, email, phone, description } = req.body;

  if (!service_key || !name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required form data' });
  }

  const servicePrices = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,           // custom pricing case
    digitalmarketing: 15000
  };

  const amountPKR = servicePrices[service_key];

  if (amountPKR === undefined || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  // Convert to paisa (amount * 100)
  const amount = (amountPKR * 100).toString();

  // Your JazzCash Merchant Credentials (use the ones given)
  const merchantId = 'MC302132';
  const integritySalt = 'z60gb5u008';  // This is the Hash value they gave you (used as salt)
  const returnUrl = 'https://naspropvt.vercel.app/api/thankyou';

  if (!merchantId || !integritySalt || !returnUrl) {
    return res.status(500).json({ error: 'Merchant credentials not configured' });
  }

  const txnRefNo = 'T' + Date.now();
  
  // Format date as 'YYYYMMDDHHmmss' for pp_TxnDateTime
  const pad = (n) => (n < 10 ? '0' + n : n);
  const now = new Date();
  const ppTxnDateTime = 
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());

  const postData = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",           // Wallet payment type
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: "",                 // **Do NOT send password to JazzCash**
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: txnRefNo,
    pp_Amount: amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: ppTxnDateTime,
    pp_BillReference: "billRef" + txnRefNo,
    pp_Description: `Payment for ${service_key}`,
    pp_ReturnURL: returnUrl,
    ppmpf_1: name,
    ppmpf_2: email,
    ppmpf_3: phone,
    ppmpf_4: service_key,
    ppmpf_5: description || "",
  };

  // Build the hash string in the correct order as per JazzCash docs
  const hashString = [
    integritySalt,
    postData.pp_Amount,
    postData.pp_BankID,
    postData.pp_BillReference,
    postData.pp_Description,
    postData.pp_Language,
    postData.pp_MerchantID,
    postData.pp_ProductID,
    postData.pp_ReturnURL,
    postData.pp_SubMerchantID,
    postData.pp_TxnCurrency,
    postData.pp_TxnDateTime,
    postData.pp_TxnRefNo,
    postData.pp_TxnType,
  ].join('&');

  // Create SHA256 hash, uppercase hex
  const secureHash = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();

  postData.pp_SecureHash = secureHash;

  // Remove pp_Password before sending to JazzCash
  delete postData.pp_Password;

  // JazzCash payment URL
  const jazzCashLiveUrl = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

  // Build hidden form inputs for redirect
  const inputs = Object.entries(postData).map(([key, val]) =>
    `<input type="hidden" name="${key}" value="${val}" />`
  ).join('\n');

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
