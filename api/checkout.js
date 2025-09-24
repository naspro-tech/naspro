// /api/checkout.js - UPDATED WITH PROPER BILL/INVOICE NUMBER
import crypto from 'crypto';

function createJazzCashHash(params, integritySalt) {
    // ✅ CORRECT: Sort fields alphabetically by ASCII value
    const sortedKeys = Object.keys(params).sort();
    
    // Build hash string with integritySalt first, then sorted fields
    let hashString = integritySalt;
    
    for (const key of sortedKeys) {
        if (key !== 'pp_SecureHash') { // Exclude the hash field itself
            hashString += '&' + params[key];
        }
    }
    
    console.log('Hash String:', hashString); // For debugging
    return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
}

// Function to generate invoice number (you can replace this with your actual invoice system)
function generateInvoiceNumber(serviceKey) {
    const now = new Date();
    const timestamp = now.getTime();
    const serviceCode = serviceKey.substring(0, 3).toUpperCase();
    return `INV-${serviceCode}-${timestamp}`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { service_key, name, email, phone, cnic, description, invoice_number } = req.body;
    
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
        return res.status(500).json({ message: 'Missing JazzCash environment variables.' });
    }

    const now = new Date();
    const txnDateTime = `${now.getFullYear()}${('0'+(now.getMonth()+1)).slice(-2)}${('0'+now.getDate()).slice(-2)}${('0'+now.getHours()).slice(-2)}${('0'+now.getMinutes()).slice(-2)}${('0'+now.getSeconds()).slice(-2)}`;
    
    const expiryTime = new Date(now.getTime() + 24*60*60*1000);
    const txnExpiryDateTime = `${expiryTime.getFullYear()}${('0'+(expiryTime.getMonth()+1)).slice(-2)}${('0'+expiryTime.getDate()).slice(-2)}${('0'+expiryTime.getHours()).slice(-2)}${('0'+expiryTime.getMinutes()).slice(-2)}${('0'+expiryTime.getSeconds()).slice(-2)}`;

    const txnRefNo = `T${now.getTime()}`;
    const formattedAmount = String(amount * 100);
    
    // ✅ CORRECT: Use provided invoice number or generate one
    const billReference = invoice_number || generateInvoiceNumber(service_key);

    const payload = {
        pp_Version: "2.0",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: merchantID,
        pp_SubMerchantID: "",
        pp_Password: password,
        pp_BankID: "",
        pp_ProductID: "",
        pp_Amount: formattedAmount,
        pp_TxnRefNo: txnRefNo,
        pp_Description: description || "Service Payment",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: txnDateTime,
        pp_BillReference: billReference, // ✅ Actual bill/invoice number
        pp_ReturnURL: returnURL,
        pp_CNIC: cnic || "",
        pp_MobileNumber: phone,
        pp_TxnExpiryDateTime: txnExpiryDateTime,
        ppmpf_1: "",
        ppmpf_2: "", 
        ppmpf_3: "",
        ppmpf_4: "",
        ppmpf_5: ""
    };

    // Create secure hash with CORRECT alphabetical sorting
    payload.pp_SecureHash = createJazzCashHash(payload, integritySalt);

    // Debug: Show the field order and values
    const sortedKeys = Object.keys(payload).sort().filter(key => key !== 'pp_SecureHash');
    console.log('Field order for hash:', sortedKeys);
    console.log('Bill Reference (Invoice #):', payload.pp_BillReference);
    console.log('Transaction Reference:', payload.pp_TxnRefNo);
    console.log('Generated Hash:', payload.pp_SecureHash);

    try {
        const apiResponse = await fetch("https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });
        
        const result = await apiResponse.json();
        
        return res.status(200).json({ 
            success: true, 
            payload,
            jazzCashResponse: result 
        });
        
    } catch (error) {
        console.error("JazzCash API error:", error);
        return res.status(500).json({ 
            message: "Failed to connect to JazzCash API.",
            error: error.message 
        });
    }
}
