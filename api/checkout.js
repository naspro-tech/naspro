import crypto from 'crypto';

// The function to sort parameters and create the string for hashing
function createHashString(params) {
    // Exclude pp_SecureHash and pp_Password from the hash string
    const excludedKeys = ['pp_SecureHash', 'pp_Password'];
    const sortedKeys = Object.keys(params).sort();
    
    let hashString = '';
    for (const key of sortedKeys) {
        if (!excludedKeys.includes(key)) {
            hashString += key + '=' + params[key] + '&';
        }
    }
    // Remove the trailing '&'
    return hashString.slice(0, -1);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { amount, mobile, cnic } = req.body;
        
        // Retrieve environment variables
        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
        const returnURL = process.env.JAZZCASH_RETURN_URL;

        if (!merchantID || !password || !integritySalt || !returnURL) {
            return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
        }

        const now = new Date();
        const txnDateTime = `${now.getFullYear()}${('0' + (now.getMonth() + 1)).slice(-2)}${('0' + now.getDate()).slice(-2)}${('0' + now.getHours()).slice(-2)}${('0' + now.getMinutes()).slice(-2)}${('0' + now.getSeconds()).slice(-2)}`;
        
        // Set expiry for 24 hours from now
        const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const txnExpiryDateTime = `${expiryTime.getFullYear()}${('0' + (expiryTime.getMonth() + 1)).slice(-2)}${('0' + expiryTime.getDate()).slice(-2)}${('0' + expiryTime.getHours()).slice(-2)}${('0' + expiryTime.getMinutes()).slice(-2)}${('0' + expiryTime.getSeconds()).slice(-2)}`;

        const txnRefNo = `T${now.getTime()}`;

        const payload = {
            "pp_Version": "2.0",
            "pp_TxnType": "MWALLET",
            "pp_Language": "EN",
            "pp_MerchantID": merchantID,
            "pp_Password": password,
            "pp_TxnRefNo": txnRefNo,
            "pp_Amount": amount,
            "pp_TxnCurrency": "PKR",
            "pp_TxnDateTime": txnDateTime,
            "pp_TxnExpiryDateTime": txnExpiryDateTime,
            "pp_BillReference": "PaymentForServices",
            "pp_Description": "Payment for services",
            "pp_CNIC": cnic,
            "pp_MobileNumber": mobile,
            "pp_ReturnURL": returnURL,
            "pp_DiscountedAmount": "",
            "ppmpf_1": "",
            "ppmpf_2": "",
            "ppmpf_3": "",
            "ppmpf_4": "",
            "ppmpf_5": ""
        };

        // Create the string to be hashed
        const hashBaseString = createHashString(payload);
        const stringToHash = `${integritySalt}&${hashBaseString}`;

        // Generate the secure hash using HMAC-SHA256
        const hmac = crypto.createHmac('sha256', password);
        hmac.update(stringToHash);
        const secureHash = hmac.digest('hex').toUpperCase();

        // Add the secure hash to the payload
        payload.pp_SecureHash = secureHash;

        return res.status(200).json({ success: true, payload });

    } catch (error) {
        console.error('Checkout API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
