export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const responseData = req.body;
  const salt = '1g90sz31w2';

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
        transactionId: responseData.pp_RetreivalReferenceNo || responseData.pp_TxnRefNo, // ✅ fixed typo
        amount: (parseInt(responseData.pp_Amount, 10) / 100).toString(), // ✅ safe parse
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: 'JazzCash',
        bankTransactionId: responseData.pp_RetreivalReferenceNo || ''
      };

      console.log('JazzCash Payment Successful:', result);

      // ✅ Use env var or fallback for redirect
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const redirectUrl = `${baseUrl}/thankyou?${new URLSearchParams(result).toString()}`;
      res.redirect(302, redirectUrl);
    } else {
      // Hash mismatch
      console.error('JazzCash Hash verification failed');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const redirectUrl = `${baseUrl}/thankyou?success=false&error=Payment verification failed`;
      res.redirect(302, redirectUrl);
    }
  } catch (error) {
    console.error('JazzCash response processing error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/thankyou?success=false&error=Payment processing error`;
    res.redirect(302, redirectUrl);
  }
        }
