// /pages/api/jazzcash_payment.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, description, mobileNumber, cnic, name, email, service, orderId } = req.body;

  // JazzCash credentials
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const salt = "z60gb5u008";

  // Helper to format date as YYYYMMDDHHMMSS
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
  };

  const now = new Date();
  const dateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const txnRefNo = "T" + Date.now().toString().slice(-11);
  const billReference = "billRef" + Date.now().toString().slice(-6);

  // Payload with empty ppmpf fields (JazzCash requires these)
  const payload = {
    pp_Amount: (amount * 100).toString(), // amount in paisa
    pp_BillReference: billReference,
    pp_CNIC: cnic,
    pp_Description: description ? description.substring(0, 200) : "",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_MobileNumber: mobileNumber,
    pp_Password: password,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: dateTime,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_TxnRefNo: txnRefNo,
    pp_SecureHash: "",
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  try {
    // Remove empty fields before hash calculation
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
    console.log("Hash String:", hashString);
    console.log("Generated Hash:", secureHash);

    res.status(200).json({
      success: true,
      payload,
      apiUrl: "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction"
    });
  } catch (error) {
    console.error("JazzCash initiation error:", error);
    res.status(500).json({ success: false, error: "Failed to initiate payment" });
  }
    }
    
