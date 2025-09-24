import crypto from 'crypto';

function calculateSecureHash(payload, integritySalt) {
  const sortedKeys = Object.keys(payload).sort().filter(k => k !== 'pp_SecureHash');
  let finalString = integritySalt + '&';
  sortedKeys.forEach((key, index) => {
    const value = payload[key] || '';
    finalString += value;
    if (value !== '' && index !== sortedKeys.length - 1) finalString += '&';
  });
  return crypto.createHmac('sha256', integritySalt)
               .update(finalString)
               .digest('hex')
               .toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { pp_TxnRefNo, pp_Amount } = req.body;

    const pp_MerchantID = process.env.JAZZCASH_MERCHANT_ID;
    const pp_Password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!pp_MerchantID || !pp_Password || !integritySalt)
      return res.status(500).json({ message: 'Missing JazzCash environment variables.' });

    const payload = {
      pp_MerchantID,
      pp_Password,
      pp_TxnRefNo,
      pp_Amount: String(pp_Amount),
      pp_TxnType: "INQUIRY",
      pp_Version: "2.0"
    };

    payload.pp_SecureHash = calculateSecureHash(payload, integritySalt);

    const apiResponse = await fetch(
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/PaymentInquiry/Inquire',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await apiResponse.json();
    return res.status(200).json({ success: true, payload, apiResponse: result });

  } catch (error) {
    console.error('JazzCash Inquiry API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
