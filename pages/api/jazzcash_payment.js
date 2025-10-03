export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, description, orderId, mobileNumber, cnic } = req.body;
  
  // Your JazzCash credentials
  const merchantId = 'MC339532';
  const password = '2282sxh9z8';
  const salt = '1g90sz31w2';
  
  // Current timestamp in required format (YYYYMMDDHHMMSS)
  const now = new Date();
  const dateTime = now.toISOString().replace(/[-:]/g, '').split('.')[0];
  const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0];
  
  // Generate transaction reference starting with 'T'
  const txnRefNo = 'T' + Date.now().toString().slice(-11);
  const billReference = 'billRef' + Date.now().toString().slice(-6);
  
  // Prepare REST API payload
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
    // Generate secure hash - EXCLUDE empty fields
    const hashData = { ...payload };
    delete hashData.pp_SecureHash;
    
    // Remove empty fields from hash calculation
    Object.keys(hashData).forEach(key => {
      if (hashData[key] === '') {
        delete hashData[key];
      }
    });
    
    // Sort keys alphabetically and create hash string
    const sortedKeys = Object.keys(hashData).sort();
    const hashValues = sortedKeys.map(key => hashData[key]);
    const hashString = salt + '&' + hashValues.join('&');
    
    const secureHash = require('crypto')
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex')
      .toUpperCase();
    
    payload.pp_SecureHash = secureHash;

    console.log('JazzCash Payload:', payload);
    console.log('Hash String:', hashString);
    console.log('Generated Hash:', secureHash);

    res.status(200).json({
      success: true,
      payload: payload,
      apiUrl: 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction'
    });

  } catch (error) {
    console.error('JazzCash REST API initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment'
    });
  }
}
