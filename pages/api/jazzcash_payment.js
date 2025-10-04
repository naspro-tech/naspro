// /pages/api/jazzcash_payment.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { amount, description, mobileNumber, name, email, service } = req.body;

  // Sandbox credentials
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const salt = "z60gb5u008";
  const returnUrl = "https://naspropvt.vercel.app/api/jazzcash_response";

  // Transaction timestamps
  const now = new Date();
  const pp_TxnDateTime = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const expiryDate = new Date(now.getTime() + 60 * 60 * 1000);
  const pp_TxnExpiryDateTime = expiryDate.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const pp_TxnRefNo = 'T' + pp_TxnDateTime;
  const pp_Amount = Math.floor(amount * 100).toString();

  const payload = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo,
    pp_Amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime,
    pp_BillReference: "billRef",
    pp_Description: description ? description.substring(0, 200) : "Transaction",
    pp_TxnExpiryDateTime,
    pp_ReturnURL: returnUrl,
    pp_SecureHash: "",
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
    pp_MobileNumber: mobileNumber,
    pp_CustomerEmail: email,
    pp_CustomerName: name,
    pp_Service: service,
  };

  // Generate secure hash
  const hashData = { ...payload };
  delete hashData.pp_SecureHash;
  Object.keys(hashData).forEach(key => { if (hashData[key] === "") delete hashData[key]; });

  const sortedKeys = Object.keys(hashData).sort();
  const hashValues = sortedKeys.map(key => hashData[key]);
  const hashString = salt + "&" + hashValues.join("&");
  payload.pp_SecureHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();

  res.status(200).json({ success: true, payload });
                                       }
