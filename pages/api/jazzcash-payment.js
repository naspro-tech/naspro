import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST method.",
    });
  }

  try {
    console.log("🎯 JazzCash Payment API called");
    console.log("Request body:", req.body);

    // Your JazzCash credentials
    const merchant_id = "MC339532";
    const password = "2282sxh9z8";
    const integrity_salt = "1g90sz31w2";
    const return_url = "https://naspro-nine.vercel.app/api/jazzcash-response";

    const { amount, description, customer_name, customer_phone, service } =
      req.body;

    if (!amount || !service) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: amount and service",
      });
    }

    const order_id = `NASPRO_${Date.now()}`;
    const txnDate = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]
      .replace("T", "");

    const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // +1 hour
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]
      .replace("T", "");

    const transactionData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchant_id,
      pp_Password: password,
      pp_BankID: "TBANK",
      pp_ProductID: "RETL",
      pp_Amount: (amount * 100).toString(),
      pp_TxnRefNo: order_id,
      pp_Description: (description || `Payment for ${service}`).substring(
        0,
        100
      ),
      pp_TxnDateTime: txnDate,
      pp_TxnExpiryDateTime: expiryDate,
      pp_BillReference: `naspro_${service}`.substring(0, 50),
      pp_ReturnURL: return_url,
      pp_TxnCurrency: "PKR",
      ppmpf_1: "1",
      ppmpf_2: "2",
      ppmpf_3: "3",
      ppmpf_4: "4",
      ppmpf_5: "5",
    };

    // Hashing
    const sortedData = {};
    Object.keys(transactionData)
      .sort()
      .forEach((key) => {
        sortedData[key] = transactionData[key];
      });

    let hashString = integrity_salt + "&";
    hashString += Object.values(sortedData).join("&");

    const secureHash = crypto
      .createHmac("sha256", integrity_salt)
      .update(hashString)
      .digest("hex");

    transactionData.pp_SecureHash = secureHash;

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
        }
