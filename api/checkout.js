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
    description
  } = req.body;

  if (!service_key || !name || !email || !phone || !description) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Map service keys to amounts (PKR)
  const servicePrices = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0, // Custom Pricing
    digitalmarketing: 15000,
  };

  // JazzCash config from environment variables
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const returnUrl = process.env.JAZZCASH_RETURN_URL;

  if (!merchantId || !password || !returnUrl) {
    res.status(500).json({ error: 'Missing payment gateway configuration' });
    return;
  }

  // Transaction date/time in YYYYMMDDHHmmss
  const txnDateTime = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  // Generate a unique order ID (e.g., timestamp + random)
  const orderId = `NASPRO${Date.now()}`;

  // Get amount for the service or fallback
  let amount = servicePrices[service_key];
  if (amount === undefined) amount = 1000; // fallback minimal amount

  // Convert PKR to Paisa (JazzCash uses paisa)
  const txnAmount = amount * 100;

  // Prepare parameters for JazzCash
  const postData = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET', // Mobile Wallet transaction type
    pp_Language: 'EN',
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: orderId,
    pp_Amount: txnAmount.toString(),
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: 'ref001',
    pp_Description: `Payment for ${service_key}`,
    pp_ReturnURL: returnUrl,
    pp_SecureHash: '', // placeholder
    ppmpf_1: name,
    ppmpf_2: email,
    ppmpf_3: phone,
    ppmpf_4: description,
    ppmpf_5: service_key,
  };

  // Generate secure hash (SHA256) — note the exact concatenation order is crucial
  // Concatenate parameters in alphabetical order of keys (excluding pp_SecureHash)
  const hashData = Object.keys(postData)
    .filter(key => key !== 'pp_SecureHash')
    .sort()
    .map(key => postData[key])
    .join('');

  const hash = crypto.createHash('sha256').update(hashData).digest('hex');

  postData.pp_SecureHash = hash;

  // Return an HTML form that auto-submits to JazzCash gateway
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <body>
        <form id="jazzcashForm" method="post" action="https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoMWalletTransaction">
          ${Object.entries(postData).map(([key, val]) =>
            `<input type="hidden" name="${key}" value="${val}" />`
          ).join('')}
        </form>
        <script>
          document.getElementById('jazzcashForm').submit();
        </script>
      </body>
    </html>
  `);
}
