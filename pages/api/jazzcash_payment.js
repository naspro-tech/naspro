export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, description, orderId, mobileNumber, cnic } = req.body;

  // Your JazzCash credentials (keep these on server only!)
  const merchantId = 'MC339532';
  const password = '2282sxh9z8';
  const salt = '1g90sz31w2';

  // Current timestamp in required format (YYYYMMDDHHMMSS)
  const now = new Date();
  const dateTime = now.toISOString().replace(/[-:]/g, '').split('.')[0];
  const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60000)
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0];

  // Generate transaction reference starting with 'T'
  const txnRefNo = 'T' + Date.now().toString().slice(-11);
  const billReference = 'billRef' + Date.now().toString().slice(-6);

  // Prepare payload
  const payload = {
    'pp_Amount': (amount * 100).toString(), // Convert to paisa
    'pp_BillReference': billReference,
    'pp_CNIC': cnic,
    'pp_Description': description.substring(0, 200),
    'pp_Language': 'EN',
    'pp_MerchantID': merchantId,
    'pp_MobileNumber': mobileNumber,
    'pp_Password': password,
    'pp_TxnCurrency': 'PKR',
    'pp_TxnDateTime': dateTime,
    'pp_TxnExpiryDateTime': expiryDateTime,
    'pp_TxnRefNo': txnRefNo,
    'pp_SecureHash': '',
    'ppmpf_1': '',
    'ppmpf_2': '',
    'ppmpf_3': '',
    'ppmpf_4': '',
    'ppmpf_5': ''
  };

  try {
    // ✅ Use your existing hash logic
    const hashData = { ...payload };
    delete hashData.pp_SecureHash;

    Object.keys(hashData).forEach(key => {
      if (hashData[key] === '') {
        delete hashData[key];
      }
    });

    const sortedKeys = Object.keys(hashData).sort();
    const sortedValues = sortedKeys.map(key => hashData[key]);
    const hashString = salt + '&' + sortedValues.join('&');

    const secureHash = require('crypto')
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    payload.pp_SecureHash = secureHash;

    console.log('🔵 JazzCash Payload:', payload);

    // ✅ Call JazzCash REST API server-to-server
    const apiUrl =
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('🟢 JazzCash Response:', result);

    // ✅ Return safe response to frontend
    res.status(200).json({
      success: result.pp_ResponseCode === '000',
      transactionId: result.pp_TxnRefNo,
      responseCode: result.pp_ResponseCode,
      responseMessage: result.pp_ResponseMessage,
    });

  } catch (error) {
    console.error('🔴 JazzCash REST API initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
    });
  }
}
