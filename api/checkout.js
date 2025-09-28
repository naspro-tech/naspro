// /api/checkout.js - JazzCash MWallet v2.0 Checkout
import { createHmac } from "crypto";

function createJazzCashHash(params, integritySalt) {
  // Only include pp_ fields except pp_SecureHash, ignore null/undefined
  const keys = Object.keys(params)
    .filter(
      (k) =>
        k.startsWith("pp_") &&
        k !== "pp_SecureHash" &&
        params[k] !== undefined &&
        params[k] !== null
    )
    .sort(); // alphabetical order

  const valuesString = keys.map((k) => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  console.log("🔑 Hash string (masked):", hashString.replace(integritySalt, "***"));

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
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
      return res.status(500).json({ message: "Missing JazzCash credentials." });
    }

    // Amount mapping
    const SERVICE_AMOUNTS = {
      webapp: 30000,
      domainhosting: 3500,
      branding: 5000,
      ecommerce: 50000,
      cloudit: 0,
      digitalmarketing: 15000,
    };

    if (!SERVICE_AMOUNTS[service_key] || SERVICE_AMOUNTS[service_key] === 0) {
      return res.status(400).json({ message: "Custom pricing service. Please contact us." });
    }

    const amount = SERVICE_AMOUNTS[service_key] * 100; // multiply by 100 per JazzCash spec
    const now = new Date();
    const txnDateTime = now
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14); // YYYYMMDDHHMMSS
    const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);

    const txnRefNo = `T${Math.floor(Date.now() / 1000)}`; // unique txn ref

    const payload = {
      pp_Version: "2.0",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchantID,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amount.toString(),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: `billRef_${txnRefNo}`,
      pp_Description: description || "Payment",
      pp_MobileNumber: phone,
      pp_CNIC: cnic,
      pp_SubMerchantID: "",
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
      DiscountProfileId: "",
    };

    // Generate secure hash
    payload.pp_SecureHash = createJazzCashHash(payload, integritySalt);

    const formData = new URLSearchParams();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }

    const endpoint = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await apiResponse.json();

    if (result.pp_ResponseCode !== "000") {
      return res.status(400).json({
        success: false,
        message: `JazzCash Error: ${result.pp_ResponseMessage}`,
        jazzCashResponse: result,
      });
    }

    return res.status(200).json({ success: true, jazzCashResponse: result, payload });
  } catch (error) {
    console.error("Checkout API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
      }
