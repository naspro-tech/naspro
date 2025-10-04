// /pages/api/jazzcash_payment.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { amount, description, mobileNumber, name, email, service } = req.body;

  // ------------------ Sandbox credentials ------------------
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const salt = "z60gb5u008";
  const version = "1.1";
  const txnType = "MWALLET";
  const language = "EN";
  const currency = "PKR";
  const bankId = "TBANK";
  const productId = "RETL";
  const returnUrl = "https://naspropvt.vercel.app/api/jazzcash_response";

  const now = new Date();
  const formatDate = (d) => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}`;
  const pp_TxnDateTime = formatDate(now);
  const pp_TxnExpiryDateTime = formatDate(new Date(now.getTime() + 1*60*60*1000)); // +1 hour
  const pp_Amount = Math.round(amount*100).toString();
  const pp_TxnRefNo = "T" + pp_TxnDateTime;

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
    pp_Description: description ? description.substring(0,200) : "Payment",
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
    const hashData = { ...payload };
    delete hashData.pp_SecureHash;
    Object.keys(hashData).forEach(k => { if(hashData[k]==="") delete hashData[k]; });
    const sortedKeys = Object.keys(hashData).sort();
    const hashString = salt + "&" + sortedKeys.map(k => hashData[k]).join("&");
    payload.pp_SecureHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();

    res.status(200).json({ success: true, payload, apiUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/Transactionmanagement/merchantform/" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to initiate payment" });
  }
}
  
