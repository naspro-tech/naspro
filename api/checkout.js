import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    service_key,
    name,
    email,
    phone,
    cnic,
    description = '',
  } = req.body;

  // Validate
  if (!service_key || !name || !email || !phone || !cnic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^\d{6}$/.test(cnic)) {
    return res.status(400).json({ error: 'CNIC must be exactly 6 digits.' });
  }

  const SERVICE_PRICES = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };
  const amount = SERVICE_PRICES[service_key];
  if (!amount || amount === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  // JazzCash credentials
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const integritySalt = "z60gb5u008";
  const paymentUrl = "https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";
  const returnUrl = "https://naspropvt.vercel.app/api/thankyou";

  const txnRefNo = 'T' + Date.now().toString();
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  // Sanitize description
  const safeDesc = description.replace(/[<>\*=%\/:'"|{}]/g, ' ').slice(0, 100);

  // Build full params with *all* necessary fields (including optional but must exist, empty string if none)
  const params = {
    pp_Version: "1.1",                  // Important: match what JazzCash expects
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",               // empty if not used
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(amount * 100),    // in paisa
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_BillReference: "BillRef",        // or empty string if not needed
    pp_Description: safeDesc,
    pp_CNIC: cnic,
    pp_MobileNumber: phone,
    pp_DiscountedAmount: "",            // empty string if no discount
    pp_ReturnURL: returnUrl,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: ""
  };

  // Compute secure hash
  params.pp_SecureHash = generateSecureHash(params, integritySalt);

  // Respond with auto-submit form
  res.setHeader('Content-Type', 'text/html');
  res.send(generateAutoSubmitForm(paymentUrl, params));
}

function formatDate(date) {
  const pad = n => (n < 10 ? '0' + n : String(n));
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function generateSecureHash(data, salt) {
  // Note: exclude pp_SecureHash itself
  // Filter keys starting with pp_, except SecureHash, in alphabetical order
  const keys = Object.keys(data)
    .filter(k => k.startsWith('pp_') && k !== 'pp_SecureHash')
    .sort();

  const values = keys.map(k => {
    // For safety, treat undefined/null as empty string
    const val = data[k];
    return (val === null || val === undefined) ? '' : String(val);
  });

  // Build string: salt + & + all values joined with &
  const stringToHash = salt + '&' + values.join('&');

  // HMAC-SHA256
  const hash = crypto.createHmac('sha256', salt)
    .update(stringToHash)
    .digest('hex')
    .toUpperCase();

  return hash;
}

function generateAutoSubmitForm(actionUrl, params) {
  const inputs = Object.entries(params)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`)
    .join('\n');

  return `
<html>
  <head><title>Redirecting...</title></head>
  <body onload="document.forms[0].submit()">
    <p>Redirecting to payment gateway...</p>
    <form method="POST" action="${actionUrl}">
      ${inputs}
    </form>
    <p>If not redirected, <button onclick="document.forms[0].submit()">Click here</button></p>
  </body>
</html>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
