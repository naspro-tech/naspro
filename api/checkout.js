// /api/checkout.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { service_key, name, email, phone, cnic, description = "Test Payment" } = req.body;

  if (!service_key || !name || !email || !phone || !cnic) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const SERVICE_PRICES = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };
  const amount = SERVICE_PRICES[service_key];
  if (!amount || amount === 0) {
    return res.status(400).json({ error: "Invalid or zero-price service selected" });
  }

  // 🔑 Hardcoded JazzCash credentials
  const MERCHANT_ID = "MC302132";
  const PASSWORD = "53v2z2u302";
  const INTEGRITY_SALT = "z60gb5u008";
  const RETURN_URL = "https://naspropvt.vercel.app/thankyou";

  const txnRefNo = "T" + Date.now();
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  // Payload with all recommended fields
  const payload = {
    pp_Language: "EN",
    pp_MerchantID: MERCHANT_ID,
    pp_SubMerchantID: "",
    pp_Password: PASSWORD,
    pp_TxnRefNo: txnRefNo,
    pp_MobileNumber: phone,
    pp_CNIC: cnic,
    pp_Amount: String(amount * 100),
    pp_DiscountedAmount: "",
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: "BillRef",
    pp_Description: description,
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_SecureHash: "",
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  // Add SecureHash
  payload.pp_SecureHash = generateSecureHash(payload, INTEGRITY_SALT);

  try {
    const response = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return res.status(200).json({ sentPayload: payload, apiResponse: result });
  } catch (err) {
    console.error("JazzCash API Error:", err.message);
    return res.status(500).json({ error: "Payment request failed. " + err.message });
  }
}

// helpers
function formatDate(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function generateSecureHash(data, salt) {
  const keys = Object.keys(data)
    .filter(k => k !== "pp_SecureHash") // exclude hash itself
    .sort();

  const hashString = keys.map(k => data[k]).join("&");
  const finalString = salt + "&" + hashString;

  return crypto
    .createHmac("sha256", salt)
    .update(finalString)
    .digest("hex")
    .toUpperCase();
}
