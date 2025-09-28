// /api/checkout.js
import { createHmac } from "crypto";

function createJazzCashHash(params, integritySalt) {
  // Filter only pp_ fields except pp_SecureHash
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash")
    .sort(); // ASCII alphabetical order

  const valuesString = keys.map(k => params[k] ?? "").join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  // Masked log
  console.log("🔑 JazzCash Hash String (masked):", hashString.replace(integritySalt, "***"));

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

// Format date as YYYYMMDDHHMMSS in PKT
function formatPKTDate(date) {
  const offset = 5 * 60 * 60 * 1000 + 0 * 60 * 1000; // PKT = UTC+5
  const pktDate = new Date(date.getTime() + offset);
  return pktDate
    .toISOString()
    .replace(/[-T:]/g, "")
    .slice(0, 14);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { service_key, name, email, phone, cnic, description } = req.body;

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!merchantID || !password || !integritySalt) {
      return res.status(500).json({ message: "Missing JazzCash environment variables." });
    }

    // Amount
    const amount = parseInt({
      webapp: 30000,
      domainhosting: 3500,
      branding: 5000,
      ecommerce: 50000,
      digitalmarketing: 15000
    }[service_key], 10);

    const txnDate = formatPKTDate(new Date());
    const expiryDate = formatPKTDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

    // Unique txn ref (random string)
    const txnRefNo = `T${Date.now()}${Math.floor(Math.random() * 9999)}`;

    const payload = {
      pp_Amount: (amount * 100).toString(), // multiply by 100
      pp_BillReference: `billRef${Math.floor(Math.random() * 100000)}`,
      pp_CNIC: cnic,
      pp_Description: description || `${service_key} Payment`,
      pp_Language: "EN",
      pp_MerchantID: merchantID,
      pp_MobileNumber: phone,
      pp_Password: password,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDate,
      pp_TxnExpiryDateTime: expiryDate,
      pp_TxnRefNo: txnRefNo,
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    // Generate SecureHash
    payload.pp_SecureHash = createJazzCashHash(payload, integritySalt);

    const formData = new URLSearchParams(payload).toString();
    const endpoint = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData,
    });

    const result = await apiResponse.json();

    return res.status(200).json({ success: true, payload, jazzCashResponse: result });
  } catch (error) {
    console.error("Checkout API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
