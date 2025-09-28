import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2";

function createJazzCashHash(params) {
  const keys = Object.keys(params)
    .filter(
      k =>
        k.startsWith("pp_") &&
        k !== "pp_SecureHash" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== ""
    )
    .sort();

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${INTEGRITY_SALT}&${valuesString}`;
  const hmac = createHmac("sha256", INTEGRITY_SALT);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { service_key, name, email, phone, cnic, description } = req.body;
    if (!service_key || !name || !email || !phone || !cnic) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const SERVICE_PRICES = { webapp: 30000, domainhosting: 3500, branding: 5000, ecommerce: 50000, cloudit: 0, digitalmarketing: 15000 };
    const amount = SERVICE_PRICES[service_key] || 0;
    const txnRefNo = "TR" + Date.now();

    const now = new Date();
    const formatDate = d => d.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

    const payload = {
      pp_Language: "EN",
      pp_MerchantID: "MC339532",
      pp_Password: "2282sxh9z8",
      pp_TxnRefNo: txnRefNo,
      pp_Amount: (amount * 100).toString(),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: formatDate(now),
      pp_BillReference: "billRef",
      pp_Description: description || "Payment for " + service_key,
      pp_TxnExpiryDateTime: formatDate(new Date(now.getTime() + 24*60*60*1000)),
      pp_MobileNumber: phone,
      pp_CNIC: cnic,
    };

    payload.pp_SecureHash = createJazzCashHash(payload);

    const formData = new URLSearchParams();
    for (const key in payload) formData.append(key, payload[key] ?? "");

    const response = await fetch("https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await response.json();
    return res.status(200).json({ success: true, jazzCashResponse: result, payload });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
