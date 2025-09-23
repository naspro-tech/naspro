import crypto from 'crypto';

function createInquiryHashString(params) {
    const excludedKeys = ['pp_SecureHash'];
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
        const { txnRefNo, amount } = req.body; // amount in paisa
        
        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!merchantID || !password || !integritySalt) {
            return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
        }

        const payload = {
            pp_MerchantID: merchantID,
            pp_Amount: amount, // in paisa
            pp_Password: password,
            pp_TxnRefNo: txnRefNo,
            pp_TxnType: "INQUIRY",
            pp_Version: "2.0"
        };
        
        const hashBaseString = createInquiryHashString(payload);
        const stringToHash = `${integritySalt}&${hashBaseString}`;
        const hmac = crypto.createHmac('sha256', integritySalt);
        hmac.update(stringToHash);
        const secureHash = hmac.digest('hex').toUpperCase();

        payload.pp_SecureHash = secureHash;

        // 🔹 Call JazzCash Inquiry API
        const apiResponse = await fetch(
            "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/PaymentInquiry/Inquire",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        const result = await apiResponse.json();

        return res.status(200).json({
            success: true,
            payload,
            apiResponse: result,
        });

    } catch (error) {
        console.error('Inquiry API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
