// /api/checkout.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2"; // put your salt here

function createJazzCashHash(params, salt) {
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
  const hashString = `${salt}&${valuesString}`;

  const hmac = createHmac("sha256", salt);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const data = req.body;

    const payload = {
      pp_Language: "EN",
      pp_MerchantID: "MC339532",
      pp_Password: "2282sxh9z8",
      pp_TxnRefNo: data.txnRef || `T${Date.now()}`,
      pp_Amount: data.amount, // amount in paisa
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

    payload.pp_SecureHash = createJazzCashHash(payload, INTEGRITY_SALT);

    return res.status(200).json({ success: true, payload });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
