// /api/checkout.js
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

    const { service_key, name, email, phone, cnic, description } = req.body;
    const SERVICE_PRICES = {
        webapp: 30000,
        domainhosting: 3500,
        branding: 5000,
        ecommerce: 50000,
        cloudit: 0,
        digitalmarketing: 15000,
    };
    const amount = SERVICE_PRICES[service_key];
    if (!amount || amount === 0) return res.status(400).json({ error: "Invalid or zero-price service selected" });

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnURL = process.env.JAZZCASH_RETURN_URL;

    if (!merchantID || !password || !integritySalt || !returnURL) {
        return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
    }

    const now = new Date();
    const txnDateTime = `${now.getFullYear()}${('0'+(now.getMonth()+1)).slice(-2)}${('0'+now.getDate()).slice(-2)}${('0'+now.getHours()).slice(-2)}${('0'+now.getMinutes()).slice(-2)}${('0'+now.getSeconds()).slice(-2)}`;
    const expiryTime = new Date(now.getTime() + 24*60*60*1000);
    const txnExpiryDateTime = `${expiryTime.getFullYear()}${('0'+(expiryTime.getMonth()+1)).slice(-2)}${('0'+expiryTime.getDate()).slice(-2)}${('0'+expiryTime.getHours()).slice(-2)}${('0'+expiryTime.getMinutes()).slice(-2)}${('0'+expiryTime.getSeconds()).slice(-2)}`;

    const txnRefNo = `T${now.getTime()}`;
    const formattedAmount = String(amount * 100);

    const payload = {
        pp_Amount: formattedAmount,
        pp_BillReference: `PaymentFor-${service_key}`,
        pp_CNIC: cnic,
        pp_Description: description || "Test Payment",
        pp_Language: "EN",
        pp_MerchantID: merchantID,
        pp_MobileNumber: phone,
        pp_Password: password,
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: txnExpiryDateTime,
        pp_TxnRefNo: txnRefNo,
        ppmpf_1: "",
        ppmpf_2: "",
        ppmpf_3: "",
        ppmpf_4: "",
        ppmpf_5: ""
    };

    // Create secure hash
    const hashBaseString = createHashString(payload);
    const stringToHash = `${integritySalt}&${hashBaseString}`;
    const hmac = crypto.createHmac('sha256', integritySalt);
    hmac.update(stringToHash);
    payload.pp_SecureHash = hmac.digest('hex').toUpperCase();

    try {
        const apiResponse = await fetch("https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await apiResponse.json();

        return res.status(200).json({
            success: true,
            payload,
            returnURL,
            apiResponse: result,
        });
    } catch (error) {
        console.error("JazzCash API error:", error);
        return res.status(500).json({ message: "Failed to connect to JazzCash API." });
    }
}
