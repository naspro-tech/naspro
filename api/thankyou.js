// /api/thankyou.js - JazzCash Return/ThankYou Handler
import crypto from "crypto";

function createJazzCashHash(params, integritySalt) {
    const keys = Object.keys(params)
        .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== "")
        .sort();

    let hashString = integritySalt + "&" + keys.map(k => params[k]).join("&");
    const hmac = crypto.createHmac("sha256", integritySalt);
    hmac.update(hashString);
    return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
    if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const responseData = req.method === "POST" ? req.body : req.query;

        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!merchantID || !password || !integritySalt) {
            return res.status(500).json({ message: "Missing JazzCash environment variables." });
        }

        const receivedHash = responseData.pp_SecureHash;
        const generatedHash = createJazzCashHash(responseData, integritySalt);

        if (receivedHash !== generatedHash) {
            console.error("❌ ThankYou Secure Hash Mismatch");
            return res.status(400).json({ message: "Invalid secure hash" });
        }

        const {
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_TxnRefNo,
            pp_Amount,
            pp_RetreivalReferenceNo,
        } = responseData;

        const success = pp_ResponseCode === "000" || pp_ResponseCode === "121";
        const amountInRupees = (parseInt(pp_Amount, 10) / 100).toFixed(2);

        return res.status(200).json({
            success,
            message: pp_ResponseMessage,
            transactionId: pp_TxnRefNo,
            retrievalReferenceNo: pp_RetreivalReferenceNo,
            amount: amountInRupees,
            transactionDetails: responseData,
        });
    } catch (error) {
        console.error("ThankYou API error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
                                     }
