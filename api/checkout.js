// /api/checkout.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2"; // Replace with your real salt
const JAZZCASH_URL =
  "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";
// ⚠️ Change to production URL when going live

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
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { amount, phone, cnic, billReference, description } = req.body;

  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: "MC339532",
    pp_Password: "2282sxh9z8",
    pp_TxnRefNo: `T${Date.now()}`,
    pp_Amount: String(Number(amount) * 100),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14),
    pp_TxnExpiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14),
    pp_BillReference: billReference || `REF${Date.now()}`,
    pp_Description: description || "Payment",
    pp_MobileNumber: phone,
    pp_CNIC: cnic,
  };

  payload.pp_SecureHash = createJazzCashHash(payload, INTEGRITY_SALT);

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${JAZZCASH_URL}">
          ${Object.entries(payload)
            .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}" />`)
            .join("\n")}
        </form>
        <p>Redirecting to JazzCash...</p>
      </body>
    </html>
  `);
}
