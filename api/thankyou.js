import crypto from 'crypto';

// The same function from checkout.js is used here for consistency
function createHashString(params) {
    const excludedKeys = ['pp_SecureHash', 'pp_Password'];
    const sortedKeys = Object.keys(params).sort();
    
    let hashString = '';
    for (const key of sortedKeys) {
        if (!excludedKeys.includes(key)) {
            hashString += key + '=' + params[key] + '&';
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
        
        // Retrieve environment variables
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!password || !integritySalt) {
            return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
        }

        const receivedHash = responseData.pp_SecureHash;
        
        // Generate a new hash from the received data to compare
        const hashBaseString = createHashString(responseData);
        const stringToHash = `${integritySalt}&${hashBaseString}`;

        const hmac = crypto.createHmac('sha256', password);
        hmac.update(stringToHash);
        const generatedHash = hmac.digest('hex').toUpperCase();

        if (receivedHash === generatedHash) {
            // Hash is valid, process the transaction
            const responseCode = responseData.pp_ResponseCode;
            const responseMessage = responseData.pp_ResponseMessage;

            if (responseCode === '000') {
                // Payment was successful
                return res.status(200).json({
                    success: true,
                    message: 'Payment was successful.',
                    transactionDetails: responseData
                });
            } else {
                // Payment failed or was cancelled
                return res.status(200).json({
                    success: false,
                    message: `Payment failed: ${responseMessage}`,
                    responseCode
                });
            }
        } else {
            // Hash mismatch, potential data tampering
            console.error('Secure Hash Mismatch');
            return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });
        }
    } catch (error) {
        console.error('Thank You API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
