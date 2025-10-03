export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const responseData = req.body;
  const salt = '1g90sz31w2';

  // Log the response for debugging
  console.log('JazzCash Response Received:', responseData);

  try {
    // Verify hash - EXCLUDE empty fields
    const receivedHash = responseData.pp_SecureHash;
    const verifyData = { ...responseData };
    delete verifyData.pp_SecureHash;

    // Remove empty fields from hash verification
    Object.keys(verifyData).forEach(key => {
      if (verifyData[key] === '') {
        delete verifyData[key];
      }
    });

    // Sort keys alphabetically and create hash string for verification
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
      // Hash verification successful
      const result = {
        success: true,
        orderId: responseData.pp_TxnRefNo,
        transactionId: responseData.pp_RetreivBufferenceNo || responseData.pp_TxnRefNo,
        amount: (responseData.pp_Amount / 100).toString(), // Convert back from paisa
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: 'JazzCash',
        bankTransactionId: responseData.pp_RetreivBufferenceNo || ''
      };

      console.log('JazzCash Payment Successful:', result);
      
      // Redirect to thank you page
      const redirectUrl = `https://naspropvt.vercel.app/thankyou?${new URLSearchParams(result).toString()}`;
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
