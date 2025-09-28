// /api/checkout.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2"; // Replace with your salt
const JAZZCASH_URL =
  "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

function createJazzCashHash(params, integritySalt) {
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

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const data = req.body;

    const now = new Date();
    const txnDateTime = now
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14); // YYYYMMDDHHMMSS
    const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    // JazzCash payload
    const payload = {
      pp_Version: "2.0",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: "MC339532", // your merchant ID
      pp_SubMerchantID: "",
      pp_Password: "2282sxh9z8", // your JazzCash password
      pp_TxnRefNo: data.txnRef || `T${Date.now()}`,
      pp_Amount: data.amount, // amount in paisa
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: data.billReference || "billRef",
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

    payload.pp_SecureHash = createJazzCashHash(payload, INTEGRITY_SALT);

    return res.status(200).json({
      success: true,
      jazzCashUrl: JAZZCASH_URL,
      jazzCashRequest: payload,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
