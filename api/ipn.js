// /api/ipn.js - JazzCash IPN Handler
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
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const responseData = req.body;

        const merchantID = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

        if (!merchantID || !password || !integritySalt) {
            return res.status(500).json({ message: "Missing JazzCash environment variables." });
        }

        const receivedHash = responseData.pp_SecureHash;
        const generatedHash = createJazzCashHash(responseData, integritySalt);

        if (receivedHash !== generatedHash) {
            console.error("❌ Secure Hash Mismatch in IPN");
            return res.status(400).json({ message: "Invalid secure hash" });
        }

        const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMessage, pp_Amount } = responseData;

        const success = pp_ResponseCode === "000" || pp_ResponseCode === "121";

        console.log(
            `📩 IPN Received: TxnRefNo=${pp_TxnRefNo}, Code=${pp_ResponseCode}, Msg=${pp_ResponseMessage}, Amount=${pp_Amount}`
        );

        return res.status(200).json({
            success,
            message: "IPN received and processed",
            transactionStatus: success ? "success" : "failed",
        });
    } catch (error) {
        console.error("IPN API error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
