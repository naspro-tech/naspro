import crypto from 'crypto';

function calculateSecureHash(payload, integritySalt) {
  const sortedKeys = Object.keys(payload).sort();
  const concatenatedValues = sortedKeys
    .filter(key => key !== 'pp_SecureHash')
    .map(key => payload[key])
    .join('&');
  const stringToHash = `${integritySalt}&${concatenatedValues}`;
  return crypto.createHmac('sha256', integritySalt)
               .update(stringToHash)
               .digest('hex')
               .toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { service_key, name, email, phone, cnic, description } = req.body;

    const SERVICE_PRICES = {
      webapp: 30000,
      domainhosting: 3500,
      branding: 5000,
      ecommerce: 50000,
      cloudit: 0,
      digitalmarketing: 15000,
    };
    const amount = SERVICE_PRICES[service_key];
    if (!amount || amount === 0) return res.status(400).json({ error: "Invalid or zero-price service selected" });

    const pp_MerchantID = process.env.JAZZCASH_MERCHANT_ID;
    const pp_Password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnURL = process.env.JAZZCASH_RETURN_URL;

    if (!pp_MerchantID || !pp_Password || !integritySalt || !returnURL)
      return res.status(500).json({ message: 'Missing JazzCash environment variables.' });

    const now = new Date();
    const pp_TxnDateTime = `${now.getFullYear()}${('0'+(now.getMonth()+1)).slice(-2)}${('0'+now.getDate()).slice(-2)}${('0'+now.getHours()).slice(-2)}${('0'+now.getMinutes()).slice(-2)}${('0'+now.getSeconds()).slice(-2)}`;
    const expiry = new Date(now.getTime() + 24*60*60*1000);
    const pp_TxnExpiryDateTime = `${expiry.getFullYear()}${('0'+(expiry.getMonth()+1)).slice(-2)}${('0'+expiry.getDate()).slice(-2)}${('0'+expiry.getHours()).slice(-2)}${('0'+expiry.getMinutes()).slice(-2)}${('0'+expiry.getSeconds()).slice(-2)}`;
    const pp_TxnRefNo = `T${now.getTime()}`;

    const payload = {
      pp_Amount: String(amount * 100),
      pp_BillReference: `PaymentFor-${service_key}`,
      pp_CNIC: cnic,
      pp_Description: description || 'Test Payment',
      pp_Language: 'EN',
      pp_MerchantID,
      pp_MobileNumber: phone,
      pp_Password,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime,
      pp_TxnExpiryDateTime,
      pp_TxnRefNo,
      ppmpf_1: '',
      ppmpf_2: '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: '',
      pp_ReturnURL: returnURL
    };

    payload.pp_SecureHash = calculateSecureHash(payload, integritySalt);

    const apiResponse = await fetch(
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await apiResponse.json();
    return res.status(200).json({ success: true, payload, apiResponse: result });

  } catch (error) {
    console.error('JazzCash Checkout API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
