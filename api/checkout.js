// /api/checkout.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2"; // Your JazzCash integrity salt

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

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const data = req.body;

    // JazzCash required parameters
    const payload = {
      pp_Version: "2.0",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: "MC339532",
      pp_UsageMode: "API",
      pp_Password: "2282sxh9z8",
      pp_TxnRefNo: data.txnRef || `TR${Date.now()}`,
      pp_Amount: data.amount, // in paisa
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: data.txnDateTime,
      pp_TxnExpiryDateTime: data.txnExpiryDateTime,
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

    // Generate secure hash including Version + TxnType
    payload.pp_SecureHash = createJazzCashHash(payload, INTEGRITY_SALT);

    // For now just return the payload (in real use, POST to JazzCash API)
    return res.status(200).json({
      success: true,
      jazzCashRequest: payload,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
