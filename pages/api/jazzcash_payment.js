// /pages/api/jazzcash_payment.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, description, mobileNumber, cnic, name, email, service, orderId } = req.body;

  // JazzCash sandbox credentials (your test creds)
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
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // same as before

  const txnRefNo = "T" + Date.now().toString().slice(-11);
  const billReference = "billRef" + Date.now().toString().slice(-6);

  // -------------------------
  // Payload (keep field names & empties as before)
  // -------------------------
  const payload = {
    pp_Amount: (amount * 100).toString(), // amount in paisa
    pp_BillReference: billReference,
    pp_CNIC: cnic || "",
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
    // === EXACT original hash formula you used ===
    // 1) copy payload and remove pp_SecureHash
    const hashData = { ...payload };
    delete hashData.pp_SecureHash;

    // 2) remove empty fields (same as your original)
    Object.keys(hashData).forEach((key) => {
      if (hashData[key] === "") delete hashData[key];
    });

    // 3) sort keys and join values
    const sortedKeys = Object.keys(hashData).sort();
    const hashValues = sortedKeys.map((key) => hashData[key]);
    const hashString = salt + "&" + hashValues.join("&");

    // 4) HMAC SHA256 using salt as key (same as your original)
    const secureHash = crypto
      .createHmac("sha256", salt)
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    // attach secure hash
    payload.pp_SecureHash = secureHash;

    // debug logs (helpful for Vercel logs)
    console.log("JazzCash Payload:", payload);
    console.log("Hash String:", hashString);
    console.log("Generated Hash:", secureHash);

    // return payload for frontend to post to JazzCash sandbox
    return res.status(200).json({
      success: true,
      payload,
      apiUrl:
        "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
    });
  } catch (error) {
    console.error("JazzCash initiation error:", error);
    return res.status(500).json({ success: false, error: "Failed to initiate payment" });
  }
                                    }
