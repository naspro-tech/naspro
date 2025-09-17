import crypto from 'crypto';

function formatDateTime(date = new Date()) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const {
    service_key = 'webapp',
    name = 'John Doe',
    email = 'john@example.com',
    phone = '03001234567',
    description = 'Order payment'
  } = req.body;

  const servicePrices = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const amountPKR = servicePrices[service_key] || 30000;
  const amount = (amountPKR * 100).toString(); // convert to paisa

  const merchantId = 'MC302132';
  const password = '53v2z2u302'; // Integrity Salt - DO NOT send in POST
  const returnUrl = 'https://naspropvt.vercel.app/api/thankyou';

  const txnRefNo = 'T' + Date.now();
  const txnDateTime = formatDateTime();

  const postData = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',
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
    pp_ReturnURL: returnUrl,
    ppmpf_1: name,
    ppmpf_2: email,
    ppmpf_3: phone,
    ppmpf_4: service_key,
    ppmpf_5: description,
  };

  // Generate hash string
  const hashString = [
    password,
    postData.pp_Amount,
    postData.pp_BillReference,
    postData.pp_Description,
    postData.pp_Language,
    postData.pp_MerchantID,
    password,
    postData.pp_ReturnURL,
    postData.pp_SubMerchantID,
    postData.pp_TxnCurrency,
    postData.pp_TxnDateTime,
    postData.pp_TxnRefNo,
    postData.pp_TxnType,
  ].join('&');

  postData.pp_SecureHash = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();

  const jazzCashUrl = 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

  // Build hidden inputs for POST form
  const inputs = Object.entries(postData)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}"/>`)
    .join('\n');

  const html = `<!DOCTYPE html>
  <html>
  <head><title>Redirecting to JazzCash...</title></head>
  <body onload="document.forms[0].submit()">
    <p>Redirecting to payment gateway...</p>
    <form method="POST" action="${jazzCashUrl}">
      ${inputs}
      <noscript><button type="submit">Click here if not redirected</button></noscript>
    </form>
  </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
