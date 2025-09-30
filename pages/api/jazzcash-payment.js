// /pages/api/jazzcash-payment.js
import crypto from "crypto";

export default async function handler(req, res) {
  // Allow CORS (optional for mobile clients)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      console.log("🎯 JazzCash Payment API called");
      console.log("Request body:", req.body);

      // JazzCash Sandbox Credentials
      const merchant_id = "MC339532";
      const password = "2282sxh9z8";
      const integrity_salt = "1g90sz31w2";
      const return_url =
        "https://naspro-nine.vercel.app/api/jazzcash-response";

      const { amount, description, service } = req.body;

      // Validate required fields
      if (!amount || !service) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: amount and service",
        });
      }

      const order_id = `NASPRO_${Date.now()}`;

      // Format timestamps
      const now = new Date();
      const formatDate = (d) =>
        d
          .toISOString()
          .replace(/[-:TZ.]/g, "")
          .slice(0, 14); // yyyyMMddHHmmss

      const txnDateTime = formatDate(now);
      const expiryDateTime = formatDate(
        new Date(now.getTime() + 24 * 60 * 60 * 1000) // +1 day
      );

      // Transaction data
      const transactionData = {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: merchant_id,
        pp_Password: password,
        pp_TxnRefNo: order_id,
        pp_Amount: (amount * 100).toString(), // convert to paisa
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_BillReference: `naspro_${service}`.substring(0, 50),
        pp_Description: (description || `Payment for ${service}`).substring(
          0,
          100
        ),
        pp_ReturnURL: return_url,
        ppmpf_1: "1",
        ppmpf_2: "2",
        ppmpf_3: "3",
        ppmpf_4: "4",
        ppmpf_5: "5",
      };

      // Build hash string (JazzCash required order)
      let hashString = integrity_salt + "&";
      hashString +=
        transactionData.pp_Amount +
        "&" +
        transactionData.pp_BillReference +
        "&" +
        transactionData.pp_Description +
        "&" +
        transactionData.pp_Language +
        "&" +
        transactionData.pp_MerchantID +
        "&" +
        transactionData.pp_Password +
        "&" +
        transactionData.pp_ReturnURL +
        "&" +
        "" + // pp_SubMerchantID (empty)
        "&" +
        transactionData.pp_TxnCurrency +
        "&" +
        transactionData.pp_TxnDateTime +
        "&" +
        transactionData.pp_TxnExpiryDateTime +
        "&" +
        transactionData.pp_TxnRefNo +
        "&" +
        transactionData.pp_TxnType +
        "&" +
        transactionData.pp_Version +
        "&" +
        transactionData.ppmpf_1 +
        "&" +
        transactionData.ppmpf_2 +
        "&" +
        transactionData.ppmpf_3 +
        "&" +
        transactionData.ppmpf_4 +
        "&" +
        transactionData.ppmpf_5;

      // Generate Secure Hash
      const secureHash = crypto
        .createHmac("sha256", integrity_salt)
        .update(hashString)
        .digest("hex");

      transactionData.pp_SecureHash = secureHash;

      console.log("✅ Secure hash generated");

      res.status(200).json({
        success: true,
        jazzcash_url:
          "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
        form_data: transactionData,
        order_id: order_id,
      });
    } catch (error) {
      console.error("❌ JazzCash API error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error: " + error.message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST method.",
    });
  }
        }
