// /api/ipn.js
import crypto from 'crypto';

function createHashString(params) {
    // Exclude pp_SecureHash from hashing
    const excludedKeys = ['pp_SecureHash'];
    const sortedKeys = Object.keys(params).sort();
    let hashString = '';
    for (const key of sortedKeys) {
        if (!excludedKeys.includes(key)) {
            hashString += params[key] + '&';
        }
    }
    // Remove trailing '&'
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

        // Validate secure hash
        const receivedHash = responseData.pp_SecureHash;
        const hashBaseString = createHashString(responseData);
        const stringToHash = `${integritySalt}&${hashBaseString}`;

        const hmac = crypto.createHmac('sha256', integritySalt);
        hmac.update(stringToHash);
        const generatedHash = hmac.digest('hex').toUpperCase();

        if (receivedHash !== generatedHash) {
            console.error('Secure Hash Mismatch in IPN');
            return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });
        }

        // At this point, hash is valid. You can update your database/order status.
        // Example placeholder logic:
        const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMessage } = responseData;
        console.log(`IPN Received: TxnRefNo=${pp_TxnRefNo}, ResponseCode=${pp_ResponseCode}, Message=${pp_ResponseMessage}`);

        // TODO: Replace this with actual DB update logic
        // await updateOrderStatus(pp_TxnRefNo, pp_ResponseCode);

        // Respond with 200 OK to acknowledge the IPN
        return res.status(200).json({ success: true, message: 'IPN received and validated successfully.' });

    } catch (error) {
        console.error('IPN API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
