// /api/checkout.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Access environment variables
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password   = process.env.JAZZCASH_PASSWORD;  // integrity salt
  const returnUrl  = process.env.JAZZCASH_RETURN_URL; // your thank you endpoint

  if (!merchantId || !password || !returnUrl) {
    return res.status(500).json({ error: 'Merchant credentials not configured' });
  }

  const {
    service_key,
    name,
    email,
    phone,
    description
  } = req.body;

  if (!service_key || !name || !email || !phone || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Map service keys to price etc
  const services = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    digitalmarketing: 15000,
    // If custom pricing (e.g. cloudit), handle separately
  };

  const pricePkr = services[service_key];
  if (!pricePkr) {
    return res.status(400).json({ error: 'Invalid service selected' });
  }

  // JazzCash amount format — often PKR * 100 (so 30000 PKR => 30000 * 100)
  const amount = pricePkr * 100;

  const txnRefNo   = 'T' + Date.now();  // or more robust unique id
  const txnDateTime = new Date().toISOString().slice(0,19).replace('T','');

  const postData = {
    pp_Version: "1.1",
    pp_TxnType: "MPAY",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: txnRefNo,
    pp_Amount: amount.toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: "BillRef" + txnRefNo,
    pp_Description: "Payment for " + service_key,
    pp_ReturnURL: returnUrl,
    ppmpf_1: name,
    ppmpf_2: email,
    ppmpf_3: phone,
    ppmpf_4: service_key,
    ppmpf_5: description
  };

  // Generate secure hash
  const sortedKeys = Object.keys(postData).sort();
  let hashString = password;  // start with integrity salt (Password)
  sortedKeys.forEach(key => {
    const value = postData[key];
    if (value !== "" && key !== 'pp_SecureHash') {
      hashString += '&' + value;
    }
  });

  const hash = crypto
    .createHmac('sha256', password)
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  postData.pp_SecureHash = hash;

  const jazzCashUrl = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

  // Build HTML to auto-submit to JazzCash
  const inputs = Object.entries(postData).map(([k, v]) =>
    `<input type="hidden" name="${k}" value="${v}" />`
  ).join('\n');

  const html = `<!DOCTYPE html>
  <html>
    <head><title>Redirecting to JazzCash</title></head>
    <body onload="document.forms[0].submit()">
      <p>Redirecting to JazzCash, please wait...</p>
      <form method="POST" action="${jazzCashUrl}">
        ${inputs}
        <noscript><button type="submit">Click here if not redirected</button></noscript>
      </form>
    </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
