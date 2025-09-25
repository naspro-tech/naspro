    // /api/checkout.js
import crypto from "crypto";

function createHashString(params, integritySalt) {
  const sortedKeys = Object.keys(params).sort();
  let hashString = integritySalt;
  for (const key of sortedKeys) {
    if (key !== "pp_SecureHash") {
      hashString += "&" + params[key];
    }
  }
  return crypto.createHmac("sha256", integritySalt).update(hashString).digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { amount, description, cnic, mobile } = req.body;

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnURL = process.env.JAZZCASH_RETURN_URL;

    const txnRefNo = "T" + Date.now();
    const txnDateTime = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const expiryDateTime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

    const formattedAmount = (parseFloat(amount) * 100).toFixed(0);

    const payload = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchantID,
      pp_SubMerchantID: "",
      pp_Password: password,
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: txnRefNo,
      pp_Amount: formattedAmount,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: billRef,
      pp_Description: description || "Service Payment",
      pp_ReturnURL: returnURL,
      pp_MobileNumber: mobile || "",
      pp_CNIC: cnic || "",
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    payload.pp_SecureHash = createHashString(payload, integritySalt);

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Checkout API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
        }
