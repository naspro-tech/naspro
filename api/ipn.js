// /api/ipn.js - FIXED JazzCash IPN Handler
import crypto from "crypto";

function createIPNHash(params, integritySalt) {
    // IPN fields order from JazzCash docs
    const fieldOrder = [
        "pp_Amount",
        "pp_BillReference",
        "pp_BankID",
        "pp_CNIC",
        "pp_Description",
        "pp_Language",
        "pp_MerchantID",
        "pp_MobileNumber",
        "pp_Password",
        "pp_ProductID",
        "pp_ResponseCode",
        "pp_ResponseMessage",
        "pp_RetreivalReferenceNo",
        "pp_SettlementExpiryDate",
        "pp_TxnCurrency",
        "pp_TxnDateTime",
        "pp_TxnExpiryDateTime",
        "pp_TxnRefNo",
        "pp_TransactionState",
        "ppmpf_1",
        "ppmpf_2",
        "ppmpf_3",
        "ppmpf_4",
        "ppmpf_5"
    ];

    let hashString = integritySalt + "&";

    for (const field of fieldOrder) {
        if (params[field] && params[field] !== "") {
            hashString += params[field] + "&";
        }
    }

    // Remove trailing "&"
    hashString = hashString.slice(0, -1);

    console.log("IPN Hash String:", hashString);

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

        // Validate secure hash
        const receivedHash = responseData.pp_SecureHash;
        const generatedHash = createIPNHash(responseData, integritySalt);

        if (receivedHash !== generatedHash) {
            console.error("❌ Secure Hash Mismatch in IPN");
            console.log("Received Hash:", receivedHash);
            console.log("Generated Hash:", generatedHash);

            return res.status(400).json({
                message: "Invalid secure hash. Data may have been tampered with."
            });
        }

        // Hash is valid - process the payment
        const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMessage, pp_Amount } = responseData;

        console.log(`📩 IPN Received: TxnRefNo=${pp_TxnRefNo}, ResponseCode=${pp_ResponseCode}, Message=${pp_ResponseMessage}, Amount=${pp_Amount}`);

        if (pp_ResponseCode === "000") {
            // Payment successful - update DB here
            console.log(`✅ Payment successful for transaction: ${pp_TxnRefNo}`);
        } else {
            // Payment failed
            console.log(`❌ Payment failed for transaction: ${pp_TxnRefNo} - ${pp_ResponseMessage}`);
        }

        // Always respond 200 OK
        return res.status(200).json({
            success: true,
            message: "IPN received and processed successfully.",
            transactionStatus: pp_ResponseCode === "000" ? "success" : "failed"
        });

    } catch (error) {
        console.error("IPN API error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
