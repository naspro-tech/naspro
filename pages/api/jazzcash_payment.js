// /pages/api/jazzcash_payment.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, description, mobileNumber, name, email, service } = req.body;

  // ------------------ JazzCash sandbox credentials ------------------
  const merchantId = "MC339532";
  const password = "2282sxh9z8";
  const salt = "1g90sz31w2";
  const version = "1.1";
  const txnType = "MWALLET";
  const language = "EN";
  const currency = "PKR";
  const bankId = "TBANK";
  const productId = "RETL";
  const returnUrl = "https://naspropvt.vercel.app/api/jazzcash_response"; // your response handler

  // ------------------ Generate transaction timestamps ------------------
  const now = new Date();
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
  };

  const pp_TxnDateTime = formatDate(now);
  const expiry = new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 hour
  const pp_TxnExpiryDateTime = formatDate(expiry);

  // ------------------ Amount in paisa ------------------
  const pp_Amount = Math.round(amount * 100).toString();

  // ------------------ Unique transaction reference ------------------
  const pp_TxnRefNo = "T" + pp_TxnDateTime;

  // ------------------ Payload for JazzCash v1.1 ------------------
  const payload = {
    pp_Version: version,
    pp_TxnType: txnType,
    pp_Language: language,
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: bankId,
    pp_ProductID: productId,
    pp_TxnRefNo,
    pp_Amount,
    pp_TxnCurrency: currency,
    pp_TxnDateTime,
    pp_BillReference: "billRef",
    pp_Description: description ? description.substring(0, 200) : "Payment",
    pp_TxnExpiryDateTime,
    pp_ReturnURL: returnUrl,
    pp_SecureHash: "",
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
  };

  try {
    // ------------------ Calculate secure hash ------------------
    const hashData = { ...payload };
    delete hashData.pp_SecureHash;

    Object.keys(hashData).forEach((key) => {
      if (hashData[key] === "") delete hashData[key];
    });

    const sortedKeys = Object.keys(hashData).sort();
    const hashValues = sortedKeys.map((key) => hashData[key]);
    const hashString = salt + "&" + hashValues.join("&");

    const secureHash = crypto
      .createHmac("sha256", salt)
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    payload.pp_SecureHash = secureHash;

    console.log("JazzCash Payload:", payload);

    res.status(200).json({
      success: true,
      payload,
    });
  } catch (error) {
    console.error("JazzCash initiation error:", error);
    res.status(500).json({ success: false, error: "Failed to initiate payment" });
  }
}
