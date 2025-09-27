// /pages/api/checkout.js - JazzCash Checkout (PascalCase + proper HMAC-SHA256)
import { createHmac } from "crypto";

function createJazzCashHash(params, integritySalt) {
  // include only pp_ fields that have a non-empty value and exclude pp_SecureHash
  const keys = Object.keys(params)
    .filter(
      (k) =>
        k.startsWith("pp_") &&
        k !== "pp_SecureHash" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== ""
    )
    .sort();

  const valuesString = keys.map((k) => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  // Masked log (never log real salt in production)
  console.log("🔑 Hash string (masked):", hashString.replace(integritySalt, "***"));

  // ✅ Generate secure hash just like CryptoJS example
  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  const secureHash = hmac.digest("hex").toUpperCase();

  return secureHash; // return this var
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
      digitalmarketing: 15000,
    };

    const amount = SERVICE_PRICES[service_key];
    if (!amount) {
      return res.status(400).json({ error: "Invalid service" });
    }

    const merchantID = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    const returnUrl = process.env.JAZZCASH_RETURN_URL;

    if (!merchantID || !password || !integritySalt) {
      return res
        .status(500)
        .json({ message: "Missing JazzCash environment variables." });
    }

    const now = new Date();
    const pad = (n) => ("0" + n).slice(-2);

    const txnDateTime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const txnExpiryDateTime = `${expiry.getFullYear()}${pad(
      expiry.getMonth() + 1
    )}${pad(expiry.getDate())}${pad(expiry.getHours())}${pad(
      expiry.getMinutes()
    )}${pad(expiry.getSeconds())}`;

    const txnRefNo = `T${Date.now()}`;
    const formattedAmount = String(amount * 100); // JazzCash expects amount * 100 (last two digits = decimals)

    // ⚡ IMPORTANT: PascalCase keys (exact as per JazzCash spec)
    const payload = {
      pp_Language: "EN",
      pp_MerchantID: merchantID,
      pp_SubMerchantID: "",
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: formattedAmount,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: bill_reference || "billRef",
      pp_Description: description || "Service Payment",
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: returnUrl,
      pp_CNIC: cnic,
      pp_MobileNumber: phone,
      pp_BankID: "",
      pp_ProductID: "",
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    // ✅ Generate SecureHash (CryptoJS style variable)
    const secureHash = createJazzCashHash(payload, integritySalt);
    payload.pp_SecureHash = secureHash;

    console.log("📦 Final payload keys sent:", Object.keys(payload).join(", "));

    // JazzCash Sandbox Endpoint
    const endpoint =
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

    const formData = new URLSearchParams();
    for (const key in payload) {
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
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
