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
    digitalmarketing: 15000
  };

  const amountPKR = servicePrices[service_key];
  if (amountPKR === undefined || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  const amount = (amountPKR * 100).toString();

  // ✅ JazzCash Test Credentials
  const merchantId = 'MC302132';
  const password = '53v2z2u302'; // MPIN / password field
  const integritySalt = 'z60gb5u008'; // ✅ provided HASH is actually the integrity salt
  const returnUrl = 'https://naspropvt.vercel.app/api/thankyou'; // must be HTTPS

  const txnRefNo = 'T' + Date.now();
  const txnDateTime = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const expiryDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

  const postData = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',
    pp_Language: 'EN',
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: amount,
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_BillReference: 'billRef123',
    pp_Description: 'Payment for ' + service_key,
    pp_ReturnURL: returnUrl,
    ppmpf_1: phone,
    ppmpf_2: email,
    ppmpf_3: name,
    ppmpf_4: service_key,
    ppmpf_5: description || 'N/A',
  };

  // ✅ HMAC-SHA256 secure hash generation
  const sortedKeys = Object.keys(postData)
    .filter(key => postData[key] !== '')
    .sort();

  const concatenatedValues = sortedKeys.map(key => postData[key]).join('&');
  const hashString = `${integritySalt}&${concatenatedValues}`;

  const secureHash = crypto
    .createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  postData.pp_SecureHash = secureHash;

  const jazzCashUrl = 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

  const formInputs = Object.entries(postData)
    .map(([key, val]) => `<input type="hidden" name="${key}" value="${val}" />`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
  <head><title>Redirecting...</title></head>
  <body onload="document.forms[0].submit()">
    <p>Redirecting to JazzCash...</p>
    <form method="POST" action="${jazzCashUrl}">
      ${formInputs}
      <noscript><button type="submit">Click here if not redirected</button></noscript>
    </form>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
