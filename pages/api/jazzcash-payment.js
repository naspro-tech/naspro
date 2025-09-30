// /pages/api/jazzcash-payment.js
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS for mobile
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log("🎯 JazzCash Payment API called");
      console.log("Request body:", req.body);

      // ✅ Hardcoded JazzCash credentials
      const merchant_id = "MC339532";
      const password = "2282sxh9z8";
      const integrity_salt = "1g90sz31w2";
      const return_url = "https://naspro-nine.vercel.app/api/jazzcash-response";

      const { amount, description, customer_name, customer_phone, service } = req.body;

      if (!amount || !service) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: amount and service"
        });
      }

      const order_id = `NASPRO_${Date.now()}`;

      // ✅ Format current datetime as YYYYMMDDHHMMSS (JazzCash requirement)
      const now = new Date();
      const pad = (n) => (n < 10 ? '0' + n : n);
      const txnDateTime = 
        now.getFullYear().toString() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds());

      // Prepare transaction data
      const transactionData = {
        "pp_Version": "1.1",
        "pp_TxnType": "MWALLET",
        "pp_Language": "EN",
        "pp_MerchantID": merchant_id,
        "pp_Password": password,
        "pp_BankID": "TBANK",
        "pp_ProductID": "RETL",
        "pp_Amount": (amount * 100).toString(), // convert to paisa
        "pp_TxnRefNo": order_id,
        "pp_Description": (description || `Payment for ${service}`).substring(0, 100),
        "pp_TxnDateTime": txnDateTime,
        "pp_BillReference": `naspro_${service}`.substring(0, 50),
        "pp_ReturnURL": return_url,
        "ppmpf_1": customer_name || "NA",
        "ppmpf_2": customer_phone || "NA",
        "ppmpf_3": service,
        "ppmpf_4": "NA",
        "ppmpf_5": "NA"
      };

      console.log("📦 Transaction data:", transactionData);

      // ✅ Generate Secure Hash
      const sortedKeys = Object.keys(transactionData).sort();
      let hashString = integrity_salt + '&' + sortedKeys.map(k => transactionData[k]).join('&');
      const secureHash = crypto.createHmac('sha256', integrity_salt)
        .update(hashString)
        .digest('hex');

      transactionData.pp_SecureHash = secureHash;
      console.log("✅ Secure hash generated");

      res.status(200).json({
        success: true,
        jazzcash_url: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
        form_data: transactionData,
        order_id: order_id
      });

    } catch (error) {
      console.error("❌ JazzCash API error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error: " + error.message
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST method.'
    });
  }
          }
    
