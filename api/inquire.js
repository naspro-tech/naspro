// /api/inquire.js - CORRECTED VERSION
import crypto from 'crypto';

function createInquiryHash(params, integritySalt) {
    const hashString = `${integritySalt}&${params.pp_MerchantID}&${params.pp_Password}&${params.pp_TxnRefNo}&${params.pp_TxnType}&${params.pp_Version}`;
    
    return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { txnRefNo } = req.body;

        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!merchantID || !password || !integritySalt) {
            return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
        }

        const payload = {
            pp_Version: "2.0",
            pp_TxnType: "INQUIRY",
            pp_MerchantID: merchantID,
            pp_Password: password,
            pp_TxnRefNo: txnRefNo,
            pp_RetreivalReferenceNo: "" // Required but can be empty
        };

        // Create secure hash
        payload.pp_SecureHash = createInquiryHash(payload, integritySalt);

        const apiResponse = await fetch(
            "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
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
            apiResponse: result
        });

    } catch (error) {
        console.error('Inquiry API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
