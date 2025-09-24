// /api/thankyou.js
import crypto from 'crypto';

function createHashString(params) {
    const excludedKeys = ['pp_SecureHash'];
    const sortedKeys = Object.keys(params).sort();
    let hashString = '';
    for (const key of sortedKeys) {
        if (!excludedKeys.includes(key)) {
            hashString += params[key] + '&';
        }
    }
    return hashString.slice(0, -1);
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
        const hashBaseString = createHashString(responseData);
        const stringToHash = `${integritySalt}&${hashBaseString}`;

        const hmac = crypto.createHmac('sha256', integritySalt);
        hmac.update(stringToHash);
        const generatedHash = hmac.digest('hex').toUpperCase();

        if (receivedHash !== generatedHash) {
            return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });
        }

        // At this point, payment is verified. You can also call inquire API if needed.
        const { pp_ResponseCode, pp_ResponseMessage, pp_TxnRefNo } = responseData;

        return res.status(200).json({
            success: pp_ResponseCode === '000',
            message: pp_ResponseMessage,
            transactionDetails: responseData,
            returnURL: process.env.JAZZCASH_RETURN_URL
        });

    } catch (error) {
        console.error('Thank You API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
