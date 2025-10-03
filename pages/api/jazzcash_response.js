export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const responseData = req.body;
  const salt = '1g90sz31w2';

  // Helper function for consistency (not used in verification but available if needed)
  function formatDate(date) {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
  }

  console.log('JazzCash Response Received:', responseData);

  try {
    // Verify hash
    const receivedHash = responseData.pp_SecureHash;
    const verifyData = { ...responseData };
    delete verifyData.pp_SecureHash;

    Object.keys(verifyData).forEach(key => {
      if (verifyData[key] === '') {
        delete verifyData[key];
      }
    });

    const sortedKeys = Object.keys(verifyData).sort();
    const hashValues = sortedKeys.map(key => verifyData[key]);
    const hashString = salt + '&' + hashValues.join('&');

    const calculatedHash = require('crypto')
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    console.log('Hash Verification:');
    console.log('Received Hash:', receivedHash);
    console.log('Calculated Hash:', calculatedHash);
    console.log('Hash String:', hashString);

    if (receivedHash === calculatedHash) {
      // Hash OK → success
      const result = {
        success: true,
        orderId: responseData.pp_TxnRefNo,
        transactionId: responseData.pp_RetreivBufferenceNo || responseData.pp_TxnRefNo,
        amount: (responseData.pp_Amount / 100).toString(), // back to PKR
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: 'JazzCash',
        bankTransactionId: responseData.pp_RetreivBufferenceNo || ''
      };

      console.log('JazzCash Payment Successful:', result);

      const redirectUrl = `https://naspropvt.vercel.app/thankyou?${new URLSearchParams(result).toString()}`;
      res.redirect(302, redirectUrl);
    } else {
      // Hash mismatch
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
