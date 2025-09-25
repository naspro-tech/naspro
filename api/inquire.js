// /api/inquire.js - FIXED for JazzCash
import crypto from "crypto";

function createInquiryHash(params, integritySalt) {
    // JazzCash Inquiry required field order
    const fieldOrder = [
        "pp_Version",
        "pp_TxnType",
        "pp_MerchantID",
        "pp_Password",
        "pp_TxnRefNo",
        "pp_RetreivalReferenceNo"
    ];

    let hashString = integritySalt + "&";

    for (const field of fieldOrder) {
        if (params[field] && params[field] !== "") {
            hashString += params[field] + "&";
        }
    }

    // Remove last "&"
    hashString = hashString.slice(0, -1);

    console.log("Inquiry Hash String:", hashString);

    const hmac = crypto.createHmac("sha256", integritySalt);
    hmac.update(hashString);
    return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { txnRefNo } = req.body;

        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!merchantID || !password || !integritySalt) {
            return res
                .status(500)
                .json({ message: "Missing JazzCash environment variables." });
        }

        const payload = {
            pp_Version: "2.0",
            pp_TxnType: "INQUIRY",
            pp_MerchantID: merchantID,
            pp_Password: password,
            pp_TxnRefNo: txnRefNo,
            pp_RetreivalReferenceNo: "", // can stay empty
        };

        // Generate secure hash
        payload.pp_SecureHash = createInquiryHash(payload, integritySalt);

        // Send as form-urlencoded
        const formData = new URLSearchParams();
        for (const key in payload) {
            formData.append(key, payload[key]);
        }

        const apiResponse = await fetch(
            "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                },
                body: formData.toString(),
            }
        );

        const result = await apiResponse.json();

        return res.status(200).json({
            success: true,
            payload,
            jazzCashResponse: result,
        });
    } catch (error) {
        console.error("Inquiry API error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
