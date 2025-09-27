// /api/checkout.js - JazzCash Checkout (fixed endpoint + lowercase fields + proper HMAC)
import crypto from "crypto";

function createJazzCashHash(params, integritySalt) {
  // include only pp_ fields that have a non-empty value and exclude pp_SecureHash
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  // do NOT log integritySalt in plaintext in production
  const masked = hashString.replace(integritySalt, "***");
  console.log("🔑 Hash string (masked):", masked);

  const hmac = crypto.createhmac("sha256", integritySalt);
  hmac.update(hashString);
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { service_key, phone, cnic, description, bill_reference } = req.body;

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
      return res.status(400).json({ error: "Invalid service" });
    }

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnUrl = process.env.JAZZCASH_RETURN_URL; // optional: set this in Vercel if you want Return URL hashed

    if (!merchantID || !password || !integritySalt) {
      return res.status(500).json({ message: "Missing JazzCash environment variables." });
    }

    const now = new Date();
    const pad = n => ("0" + n).slice(-2);
    const txnDateTime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const txnExpiryDateTime = `${expiry.getFullYear()}${pad(expiry.getMonth() + 1)}${pad(expiry.getDate())}${pad(expiry.getHours())}${pad(expiry.getMinutes())}${pad(expiry.getSeconds())}`;

    const txnRefNo = `T${Date.now()}`;
    const formattedAmount = String(amount * 100); // JazzCash expects amount * 100 (last two digits = decimals)

    // Build minimal payload with lowercase pp_ keys matching JazzCash example
    const payload = {
      pp_amount: formattedAmount,
      pp_bankID: "",           // include but empty (will be filtered out for hash if empty)
      pp_billReference: "billRef",
      pp_cnic: cnic,
      pp_description: description || "Service Payment",
      pp_language: "EN",
      pp_merchantID: merchantID,
      pp_mobileNumber: phone,
      pp_password: password,
      pp_productID: "",        // include but empty
      pp_txnCurrency: "PKR",
      pp_txnDateTime: txnDateTime,
      pp_txnExpiryDateTime: txnExpiryDateTime,
      pp_txnRefNo: txnRefNo,
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    // Optional: include return URL in payload (only if you set it in env)
    if (returnUrl) {
      // note: add lowercase key so it participates correctly in sorting/hashing
      payload.pp_returnURL = returnUrl;
    }

    // Generate SecureHash as per JazzCash spec
    payload.pp_SecureHash = createJazzCashHash(payload);

    console.log("📦 Final payload keys sent (lowercase):", Object.keys(payload).join(", "));

    // Use the correct DoMWalletTransaction endpoint (sandbox)
    const endpoint = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";
    // For live use: "https://payment.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction"

    const formData = new URLSearchParams();
    for (const key in payload) {
      // ensure values appended as strings
      formData.append(key, payload[key] ?? "");
    }

    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    const result = await apiResponse.json();

    console.log("📩 JazzCash Response:", result);

    return res.status(200).json({
      success: true,
      endpoint,
      payload,
      jazzCashResponse: result,
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
