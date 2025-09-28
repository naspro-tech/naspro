// /api/checkout.js
import { createHmac } from "crypto";

// 🔥 Hardcoded JazzCash credentials (Sandbox)
const MERCHANT_ID = "MC339532";
const PASSWORD = "2282sxh9z8";
const INTEGRITY_SALT = "1g90sz31w2"; // replace with your actual salt
const JAZZCASH_URL =
  "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

// Function to create SecureHash
function createJazzCashHash(params) {
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
  const hashString = `${INTEGRITY_SALT}&${valuesString}`;

  const hmac = createHmac("sha256", INTEGRITY_SALT);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body;

    // Transaction date & expiry
    const now = new Date();
    const txnDateTime = now.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);

    // Build payload
    const payload = {
      pp_Language: "EN",
      pp_MerchantID: MERCHANT_ID,
      pp_Password: PASSWORD,
      pp_TxnRefNo: data.txnRef || `T${Date.now()}`,
      pp_Amount: data.amount, // must be in paisa (e.g. 3000000 = PKR 30,000)
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: data.billReference || "billRef123",
      pp_Description: data.description || "Payment",
      pp_MobileNumber: data.phone,
      pp_CNIC: data.cnic,
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
      DiscountProfileId: "",
    };

    // Generate secure hash
    payload.pp_SecureHash = createJazzCashHash(payload);

    // Call JazzCash API
    const response = await fetch(JAZZCASH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
