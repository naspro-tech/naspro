import crypto from 'crypto';

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
        
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
        const merchantID = process.env.JAZZCASH_MERCHANT_ID;

        if (!password || !integritySalt || !merchantID) {
            return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
        }

        const receivedHash = responseData.pp_SecureHash;
        const hashBaseString = createHashString(responseData);
        const stringToHash = `${integritySalt}&${hashBaseString}`;

        const hmac = crypto.createHmac('sha256', integritySalt);
        hmac.update(stringToHash);
        const generatedHash = hmac.digest('hex').toUpperCase();

        // ✅ Verify secure hash first
        if (receivedHash === generatedHash) {
            const responseCode = responseData.pp_ResponseCode;
            const responseMessage = responseData.pp_ResponseMessage;

            // 🔹 OPTIONAL: confirm with JazzCash Inquiry API
            try {
                const inquiryPayload = {
                    pp_MerchantID: merchantID,
                    pp_Password: password,
                    pp_TxnRefNo: responseData.pp_TxnRefNo,
                    pp_TxnType: "INQUIRY",
                    pp_Version: "2.0",
                };

                const inquiryHashBase = createHashString(inquiryPayload);
                const inquiryStringToHash = `${integritySalt}&${inquiryHashBase}`;
                const inquiryHmac = crypto.createHmac('sha256', password);
                inquiryHmac.update(inquiryStringToHash);
                inquiryPayload.pp_SecureHash = inquiryHmac.digest('hex').toUpperCase();

                const apiResponse = await fetch(
                    "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(inquiryPayload),
                    }
                );

                const inquiryResult = await apiResponse.json();

                if (responseCode === '000') {
                    return res.status(200).json({
                        success: true,
                        message: 'Payment was successful.',
                        transactionDetails: responseData,
                        inquiryResponse: inquiryResult
                    });
                } else {
                    return res.status(200).json({
                        success: false,
                        message: `Payment failed: ${responseMessage}`,
                        responseCode,
                        transactionDetails: responseData,
                        inquiryResponse: inquiryResult
                    });
                }
            } catch (err) {
                console.error("Inquiry API call failed:", err);
                return res.status(200).json({
                    success: responseCode === '000',
                    message: responseMessage,
                    transactionDetails: responseData,
                    inquiryResponse: "Inquiry API failed"
                });
            }

        } else {
            console.error('Secure Hash Mismatch');
            return res.status(400).json({ message: 'Invalid secure hash. Data may have been tampered with.' });
        }
    } catch (error) {
        console.error('Thank You API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
