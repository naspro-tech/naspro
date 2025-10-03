export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const responseData = req.body;
  const salt = '1g90sz31w2';

  // Log the response for debugging
  console.log('JazzCash Response:', responseData);

  try {
    // Verify hash
    const receivedHash = responseData.pp_SecureHash;
    const verifyData = { ...responseData };
    delete verifyData.pp_SecureHash;

    // Sort keys alphabetically and create hash string for verification
    const sortedKeys = Object.keys(verifyData).sort();
    const hashString = salt + '&' + sortedKeys.map(key => verifyData[key]).join('&');
    
    const calculatedHash = require('crypto')
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex');

    if (receivedHash === calculatedHash) {
      // Hash verification successful
      const result = {
        success: true,
        orderId: responseData.pp_TxnRefNo,
        transactionId: responseData.pp_BankTxnID || responseData.pp_TxnRefNo,
        amount: (responseData.pp_Amount / 100).toString(), // Convert back from paisa
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: 'JazzCash',
        bankTransactionId: responseData.pp_BankTxnID || ''
      };

      // Store in localStorage via query params (will be picked up by thankyou page)
      const redirectUrl = `https://naspropvt.vercel.app/thankyou?${new URLSearchParams(result).toString()}`;
      
      console.log('JazzCash Payment Successful, redirecting to:', redirectUrl);
      res.redirect(302, redirectUrl);
    } else {
      // Hash verification failed
      console.error('JazzCash Hash verification failed');
      const redirectUrl = `https://naspropvt.vercel.app/thankyou?success=false&error=Payment verification failed`;
      res.redirect(302, redirectUrl);
    }
  } catch (error) {
    console.error('JazzCash response processing error:', error);
    const redirectUrl = `https://naspropvt.vercel.app/thankyou?success=false&error=Payment processing error`;
    res.redirect(302, redirectUrl);
  }
}
