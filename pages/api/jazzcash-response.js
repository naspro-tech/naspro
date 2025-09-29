import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const integrity_salt = "1g90sz31w2";
    
    const response = req.body;
    const receivedHash = response.pp_SecureHash;
    
    // Remove hash from response for verification
    const responseWithoutHash = { ...response };
    delete responseWithoutHash.pp_SecureHash;
    
    // Sort and create hash string
    const sortedResponse = {};
    Object.keys(responseWithoutHash).sort().forEach(key => {
      sortedResponse[key] = responseWithoutHash[key];
    });
    
    let hashString = integrity_salt + '&';
    hashString += Object.values(sortedResponse).join('&');
    
    const calculatedHash = crypto.createHmac('sha256', integrity_salt)
      .update(hashString)
      .digest('hex');
    
    if (receivedHash === calculatedHash) {
      const responseCode = response.pp_ResponseCode;
      
      if (responseCode === '000') {
        // Payment successful - redirect to thank you page
        const amount = response.pp_Amount / 100;
        const service = response.pp_BillReference.replace('naspro_', '');
        
        res.redirect(302, `/thankyou?service=${service}&amount=${amount}&payment_method=jazzcash&status=success&transaction_id=${response.pp_TxnRefNo}`);
      } else {
        // Payment failed
        res.redirect(302, `/payment?error=Payment failed: ${response.pp_ResponseMessage}&error_code=${responseCode}`);
      }
    } else {
      // Hash verification failed
      res.redirect(302, '/payment?error=Security error: Invalid payment response');
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
