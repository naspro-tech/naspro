// /api/thankyou.js - CORRECTED VERSION
import crypto from 'crypto';

function createThankYouHash(params, integritySalt) {
    // Sort fields alphabetically by ASCII value
    const sortedKeys = Object.keys(params).sort();
    
    let hashString = integritySalt;
    for (const key of sortedKeys) {
        if (key !== 'pp_SecureHash') {
            hashString += '&' + params[key];
        }
    }
    
    const hmac = crypto.createHmac('sha256', integritySalt);
hmac.update(hashString);
return hmac.digest('hex').toUpperCase();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const responseData = req.body;

        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!merchantID || !password || !integritySalt) {
            return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
        }

        const receivedHash = responseData.pp_SecureHash;
        const generatedHash = createThankYouHash(responseData, integritySalt);

        if (receivedHash !== generatedHash) {
            console.error('ThankYou Page: Secure Hash Mismatch');
            console.log('Received Hash:', receivedHash);
            console.log('Generated Hash:', generatedHash);
            return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });
        }

        const { pp_ResponseCode, pp_ResponseMessage, pp_TxnRefNo, pp_Amount, pp_RetreivalReferenceNo } = responseData;

        // Convert amount back to rupees (from paisas)
        const amountInRupees = (parseInt(pp_Amount) / 100).toFixed(2);

        return res.status(200).json({
            success: pp_ResponseCode === '000',
            message: pp_ResponseMessage,
            transactionId: pp_TxnRefNo,
            retrievalReferenceNo: pp_RetreivalReferenceNo,
            amount: amountInRupees,
            transactionDetails: responseData
        });

    } catch (error) {
        console.error('Thank You API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
