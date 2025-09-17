import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    service_key,
    name,
    email,
    phone,
    cnic,
    description = '',
  } = req.body;

  // Validate inputs
  if (!service_key || !name || !email || !phone || !cnic) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
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
    res.status(400).json({ error: 'Invalid or zero-price service selected' });
    return;
  }

  // JazzCash credentials - replace these with your actual values
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const integritySalt = "z60gb5u008";
  const paymentUrl = "https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";
  const returnUrl = "https://naspropvt.vercel.app/api/thankyou";

  // Create unique txn ref number
  const txnRefNo = 'T' + Date.now();

  // Format dates in yyyyMMddHHmmss
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +1 day expiry

  // Clean description to remove invalid chars
  const safeDescription = description.replace(/[<>\*=%\/:'"|{}]/g, ' ').slice(0, 100);

  // Build params object (all required fields)
  const params = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(amount * 100),  // Amount in paisa (no decimals)
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_BillReference: "BillRef",
    pp_Description: safeDescription,
    pp_CNIC: cnic,
    pp_MobileNumber: phone,
    pp_DiscountedAmount: "",
    pp_ReturnURL: returnUrl,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  // Generate Secure Hash
  params.pp_SecureHash = generateSecureHash(params, integritySalt);

  // Return an HTML page with an auto-submitting form to JazzCash payment gateway
  res.setHeader('Content-Type', 'text/html');
  res.send(generateAutoSubmitForm(paymentUrl, params));
}

// Format date to yyyyMMddHHmmss (JazzCash requires this)
function formatDate(date) {
  const pad = n => (n < 10 ? '0' + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

// Generate secure hash per JazzCash spec
function generateSecureHash(data, salt) {
  // Sort keys alphabetically, include only keys starting with "pp_" and with non-empty value except SecureHash itself
  const keys = Object.keys(data).filter(k => k.startsWith('pp_') && k !== 'pp_SecureHash' && data[k] !== '').sort();

  const hashString = [salt, ...keys.map(k => data[k])].join('&');

  return crypto.createHmac('sha256', salt).update(hashString).digest('hex').toUpperCase();
}

// Generate auto-submitting HTML form
function generateAutoSubmitForm(actionUrl, params) {
  const inputs = Object.entries(params)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`)
    .join('\n');

  return `
    <html>
      <head>
        <title>Redirecting to JazzCash...</title>
      </head>
      <body onload="document.forms[0].submit()" style="font-family: Arial, sans-serif; text-align: center; padding-top: 100px;">
        <p>Redirecting you to secure payment gateway...</p>
        <form method="POST" action="${actionUrl}">
          ${inputs}
        </form>
        <p>If you are not redirected automatically, <button onclick="document.forms[0].submit()">click here</button>.</p>
      </body>
    </html>
  `;
}

// Simple escape function for HTML attribute values
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
