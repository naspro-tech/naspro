// /pages/api/jazzcash-response.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const integrity_salt = "1g90sz31w2"; // ✅ your salt

      const response = req.body;
      console.log("🎯 JazzCash Response:", response);

      const receivedHash = response.pp_SecureHash;

      // Remove hash before calculating
      const responseWithoutHash = { ...response };
      delete responseWithoutHash.pp_SecureHash;

      // Sort keys for hash string
      const sortedKeys = Object.keys(responseWithoutHash).sort();
      let hashString = integrity_salt + '&' + sortedKeys.map(k => responseWithoutHash[k]).join('&');

      const calculatedHash = crypto.createHmac('sha256', integrity_salt)
        .update(hashString)
        .digest('hex');

      if (receivedHash === calculatedHash) {
        const responseCode = response.pp_ResponseCode;

        if (responseCode === '000') {
          // ✅ Payment successful
          const amount = parseInt(response.pp_Amount) / 100;
          const service = response.pp_BillReference.replace('naspro_', '');
          const txnId = response.pp_TxnRefNo;

          return res.redirect(302, `/thankyou?service=${service}&amount=${amount}&payment_method=jazzcash&status=success&transaction_id=${txnId}`);
        } else {
          // ❌ Payment failed
          return res.redirect(302, `/payment?error=Payment failed: ${response.pp_ResponseMessage}&error_code=${responseCode}`);
        }
      } else {
        // ❌ Hash mismatch
        return res.redirect(302, '/payment?error=Security error: Invalid payment response');
      }

    } catch (error) {
      console.error("❌ JazzCash Response error:", error);
      return res.redirect(302, '/payment?error=Internal server error while processing payment');
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
