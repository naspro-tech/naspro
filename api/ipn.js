// /api/ipn.js - CORRECTED VERSION
import crypto from 'crypto';

function createIPNHash(params, integritySalt) {
    // Sort fields alphabetically by ASCII value
    const sortedKeys = Object.keys(params).sort();
    
    let hashString = integritySalt;
    for (const key of sortedKeys) {
        if (key !== 'pp_SecureHash') {
            hashString += '&' + params[key];
        }
    }
    
    return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
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
        const generatedHash = createIPNHash(responseData, integritySalt);

        if (receivedHash !== generatedHash) {
            console.error('Secure Hash Mismatch in IPN');
            console.log('Received Hash:', receivedHash);
            console.log('Generated Hash:', generatedHash);
            return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });
        }

        // Hash is valid - process the payment
        const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMessage, pp_Amount } = responseData;
        
        console.log(`IPN Received: TxnRefNo=${pp_TxnRefNo}, ResponseCode=${pp_ResponseCode}, Message=${pp_ResponseMessage}, Amount=${pp_Amount}`);

        if (pp_ResponseCode === '000') {
            // Payment successful - update your database
            console.log(`✅ Payment successful for transaction: ${pp_TxnRefNo}`);
            // await updateOrderStatus(pp_TxnRefNo, 'completed');
        } else {
            // Payment failed
            console.log(`❌ Payment failed for transaction: ${pp_TxnRefNo} - ${pp_ResponseMessage}`);
            // await updateOrderStatus(pp_TxnRefNo, 'failed');
        }

        // Always respond with 200 OK to acknowledge IPN
        return res.status(200).json({ 
            success: true, 
            message: 'IPN received and processed successfully.',
            transactionStatus: pp_ResponseCode === '000' ? 'success' : 'failed'
        });

    } catch (error) {
        console.error('IPN API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
