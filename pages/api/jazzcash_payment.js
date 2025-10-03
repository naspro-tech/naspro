export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, description, orderId } = req.body;
  
  // Your JazzCash credentials
  const merchantId = 'MC339532';
  const password = '2282sxh9z8';
  const salt = '1g90sz31w2';
  
  // Generate unique transaction reference if not provided
  const transactionRef = orderId || 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
  
  // Current timestamp in required format (YYYYMMDDHHMMSS)
  const now = new Date();
  const dateTime = now.toISOString().replace(/[-:]/g, '').split('.')[0];
  const expiryDateTime = new Date(now.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0];
  
  // Prepare data for hash generation
  const postData = {
    'pp_Version': '1.1',
    'pp_TxnType': '',
    'pp_Language': 'EN',
    'pp_MerchantID': merchantId,
    'pp_Password': password,
    'pp_TxnRefNo': transactionRef,
    'pp_Amount': (amount * 100).toString(), // Convert to paisa
    'pp_TxnCurrency': 'PKR',
    'pp_TxnDateTime': dateTime,
    'pp_BillReference': transactionRef,
    'pp_Description': description.substring(0, 100), // Limit to 100 chars
    'pp_TxnExpiryDateTime': expiryDateTime,
    'pp_ReturnURL': `https://naspropvt.vercel.app/api/jazzcash_response`,
    'pp_SecureHash': '',
    'ppmpf_1': '1',
    'ppmpf_2': '2',
    'ppmpf_3': '3',
    'ppmpf_4': '4',
    'ppmpf_5': '5'
  };

  try {
    // Generate secure hash
    const hashData = { ...postData };
    delete hashData.pp_SecureHash;
    
    // Sort keys alphabetically and create hash string
    const sortedKeys = Object.keys(hashData).sort();
    const hashString = salt + '&' + sortedKeys.map(key => hashData[key]).join('&');
    
    const secureHash = require('crypto')
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex');
    
    postData.pp_SecureHash = secureHash;

    res.status(200).json({
      success: true,
      paymentData: postData,
      orderId: transactionRef,
      redirectUrl: 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/'
    });

  } catch (error) {
    console.error('JazzCash payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment'
    });
  }
}
