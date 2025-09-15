// /api/checkout.js

import crypto from 'crypto';

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
    cloudit: 0,           // custom pricing case
    digitalmarketing: 15000
  };

  const amountPKR = servicePrices[service_key];
  if (amountPKR === undefined || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero‑price service selected' });
  }

  // Convert to paisa (amount * 100)
  const amount = (amountPKR * 100).toString();

  // Load from environment variables
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;     // set this in Vercel
  const password   = process.env.JAZZCASH_PASSWORD;        // your integrity salt / password
  const returnUrl  = process.env.JAZZCASH_RETURN_URL;      // e.g. https://yourdomain.com/thankyou

  if (!merchantId || !password || !returnUrl) {
    return res.status(500).json({ error: 'Merchant credentials not configured' });
  }

  const txnRefNo   = 'T' + Date.now();
  const txnDateTime = new Date().toISOString().slice(0,19).replace('T',' ');

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
    pp_Amount: amount,
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
  let hashString = password;
  sortedKeys.forEach(key => {
    const val = postData[key];
    if (val !== "" && key !== 'pp_SecureHash') {
      hashString += '&' + val;
    }
  });

  const secureHash = crypto
    .createHmac('sha256', password)
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  postData.pp_SecureHash = secureHash;

  const jazzCashLiveUrl = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

  const inputs = Object.entries(postData).map(([k, v]) =>
    `<input type="hidden" name="${k}" value="${v}" />`
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
