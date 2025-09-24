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
    const responseData = req.body;

    const pp_MerchantID = process.env.JAZZCASH_MERCHANT_ID;
    const pp_Password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!pp_MerchantID || !pp_Password || !integritySalt)
      return res.status(500).json({ message: 'Missing JazzCash environment variables.' });

    const receivedHash = responseData.pp_SecureHash;
    const generatedHash = calculateSecureHash(responseData, integritySalt);

    if (receivedHash !== generatedHash)
      return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });

    // Optionally, you can call inquiry API to double-check
    const inquiryPayload = {
      pp_MerchantID,
      pp_Password,
      pp_TxnRefNo: responseData.pp_TxnRefNo,
      pp_TxnType: "INQUIRY",
      pp_Version: "2.0"
    };
    inquiryPayload.pp_SecureHash = calculateSecureHash(inquiryPayload, integritySalt);

    const inquiryResponse = await fetch(
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/PaymentInquiry/Inquire',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryPayload)
      }
    );

    const inquiryResult = await inquiryResponse.json();

    return res.status(200).json({
      success: responseData.pp_ResponseCode === '000',
      transactionDetails: responseData,
      inquiryResponse: inquiryResult
    });

  } catch (error) {
    console.error('JazzCash Thank You API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
