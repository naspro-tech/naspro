import crypto from 'crypto';

// Function to build hash string in ascending order
function createHashString(params) {
    const sortedKeys = Object.keys(params).sort(); // ascending order
    let hashString = '';
    for (const key of sortedKeys) {
        hashString += key + '=' + params[key] + '&';
    }
    return hashString.slice(0, -1); // remove trailing &
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { service_key, name, email, phone, cnic } = req.body;
    const description = (req.body.description || "Test Payment").trim();

    const SERVICE_PRICES = {
        webapp: 30000,
        domainhosting: 3500,
        branding: 5000,
        ecommerce: 50000,
        cloudit: 0,
        digitalmarketing: 15000,
    };
    const amount = SERVICE_PRICES[service_key];
    if (!amount || amount === 0) return res.status(400).json({ error: "Invalid service" });

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnURL = process.env.JAZZCASH_RETURN_URL;

    if (!merchantID || !password || !integritySalt || !returnURL) {
        return res.status(500).json({ message: "Missing JazzCash environment variables" });
    }

    try {
        const now = new Date();
        const txnDateTime = `${now.getFullYear()}${('0'+(now.getMonth()+1)).slice(-2)}${('0'+now.getDate()).slice(-2)}${('0'+now.getHours()).slice(-2)}${('0'+now.getMinutes()).slice(-2)}${('0'+now.getSeconds()).slice(-2)}`;
        const expiryTime = new Date(now.getTime() + 24*60*60*1000);
        const txnExpiryDateTime = `${expiryTime.getFullYear()}${('0'+(expiryTime.getMonth()+1)).slice(-2)}${('0'+expiryTime.getDate()).slice(-2)}${('0'+expiryTime.getHours()).slice(-2)}${('0'+expiryTime.getMinutes()).slice(-2)}${('0'+expiryTime.getSeconds()).slice(-2)}`;

        const txnRefNo = `T${now.getTime()}`;
        const formattedAmount = String(amount * 100);

        // Full payload for JazzCash
        const payload = {
            pp_Version: "2.0",
            pp_TxnType: "MWALLET",
            pp_Language: "EN",
            pp_MerchantID: merchantID,
            pp_Password: password,
            pp_TxnRefNo: txnRefNo,
            pp_Amount: formattedAmount,
            pp_TxnCurrency: "PKR",
            pp_TxnDateTime: txnDateTime,
            pp_TxnExpiryDateTime: txnExpiryDateTime,
            pp_BillReference: "PaymentForServices",
            pp_Description: description,
            pp_CNIC: cnic,
            pp_MobileNumber: phone,
            pp_ReturnURL: returnURL,
            pp_DiscountedAmount: "",
            ppmpf_1: "",
            ppmpf_2: "",
            ppmpf_3: "",
            ppmpf_4: "",
            ppmpf_5: ""
        };

        // ✅ Only required keys for hash
        const hashPayload = {
            pp_Amount: payload.pp_Amount,
            pp_BillReference: payload.pp_BillReference,
            pp_CNIC: payload.pp_CNIC,
            pp_Description: payload.pp_Description,
            pp_Language: payload.pp_Language,
            pp_MerchantID: payload.pp_MerchantID,
            pp_MobileNumber: payload.pp_MobileNumber,
            pp_Password: payload.pp_Password,
            pp_TxnCurrency: payload.pp_TxnCurrency,
            pp_TxnDateTime: payload.pp_TxnDateTime,
            pp_TxnExpiryDateTime: payload.pp_TxnExpiryDateTime,
            pp_TxnRefNo: payload.pp_TxnRefNo
        };

        const hashBaseString = createHashString(hashPayload);
        const stringToHash = `${integritySalt}&${hashBaseString}`;

        // HMAC-SHA256 hash
        const hmac = crypto.createHmac('sha256', integritySalt);
        hmac.update(stringToHash);
        payload.pp_SecureHash = hmac.digest('hex').toUpperCase(); // ✅ This ensures pp_SecureHash exists

        console.log("Payload with secure hash:", payload); // Debug

        const apiResponse = await fetch(
            "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        const resultText = await apiResponse.text();
        let resultJson;
        try {
            resultJson = JSON.parse(resultText);
        } catch {
            return res.status(500).json({ message: "Failed to parse JazzCash response", rawResponse: resultText });
        }

        return res.status(200).json({ success: true, payload, apiResponse: resultJson });

    } catch (error) {
        console.error("JazzCash API error:", error);
        return res.status(500).json({ message: "Failed to connect to JazzCash API", error: error.message });
    }
}
