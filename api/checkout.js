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
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const amountPKR = servicePrices[service_key];
  if (amountPKR === undefined || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  const amount = (amountPKR * 100).toString(); // amount in paisa

  const merchantId = 'MC302132';
  const password = '53v2z2u302';  // Integrity Salt
  const returnUrl = 'https://naspropvt.vercel.app/api/thankyou';

  if (!merchantId || !password || !returnUrl) {
    return res.status(500).json({ error: 'Merchant credentials not configured' });
  }

  const txnRefNo = 'T' + Date.now();
  const txnDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Prepare post data WITHOUT pp_Password (do not send password to JazzCash)
  const postData = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",   // Or "MPAY" depending on your integration type
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
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
    ppmpf_5: description && description.trim() !== '' ? description : 'No description provided',
  };

  // Create hash string in exact order specified by JazzCash:
  // Format: Password&pp_Amount&pp_BankID&pp_BillReference&pp_Description&pp_Language&pp_MerchantID&Password&pp_ProductID&pp_ReturnURL&pp_SubMerchantID&pp_TxnCurrency&pp_TxnDateTime&pp_TxnRefNo&pp_TxnType
  const hashString = [
    password,
    postData.pp_Amount,
    postData.pp_BankID,
    postData.pp_BillReference,
    postData.pp_Description,
    postData.pp_Language,
    postData.pp_MerchantID,
    password,
    postData.pp_ProductID,
    postData.pp_ReturnURL,
    postData.pp_SubMerchantID,
    postData.pp_TxnCurrency,
    postData.pp_TxnDateTime,
    postData.pp_TxnRefNo,
    postData.pp_TxnType
  ].join('&');

  const secureHash = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();

  postData.pp_SecureHash = secureHash;

  const jazzCashLiveUrl = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

  const inputs = Object.entries(postData)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}" />`)
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
