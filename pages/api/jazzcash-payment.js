// /pages/api/jazzcash-payment.js
import crypto from "crypto";
import moment from "moment-timezone";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, service, customerName, customerMobile } = req.body;

    const integrity_salt = 1g90sz31w2;
    const merchant_id = MC339532;
    const password = 2282sxh9z8;

    if (!integrity_salt || !merchant_id || !password) {
      throw new Error("JazzCash credentials missing in environment variables");
    }

    // Timestamps (Pakistan Time)
    const txnDateTime = moment().tz("Asia/Karachi").format("YYYYMMDDHHmmss");
    const txnExpiryDateTime = moment()
      .tz("Asia/Karachi")
      .add(1, "hours")
      .format("YYYYMMDDHHmmss");

    const txnRefNo = "T" + txnDateTime;

    // Build payload
    let payload = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchant_id,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amount * 100, // JazzCash expects PKR * 100
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: `naspro_${service}`,
      pp_Description: `Payment for ${service}`,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: "https://naspro-nine.vercel.app/api/jazzcash-response",
      ppmpf_1: customerName || "Guest",
      ppmpf_2: customerMobile || "",
    };

    // Generate Secure Hash
    const sortedKeys = Object.keys(payload).sort();
    let hashString = integrity_salt;
    sortedKeys.forEach((key) => {
      if (payload[key] !== "") hashString += "&" + payload[key];
    });

    const secureHash = crypto
      .createHmac("sha256", integrity_salt)
      .update(hashString)
      .digest("hex");

    payload.pp_SecureHash = secureHash;

    // Debug log (excluding password)
    const { pp_Password, ...safeLog } = payload;
    console.log("JazzCash Payload:", safeLog);

    // Render HTML auto-submit form
    const formInputs = Object.entries(payload)
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${value}" />`
      )
      .join("\n");

    const html = `
      <html>
        <body onload="document.forms[0].submit()">
          <p>Redirecting to JazzCash...</p>
          <form method="POST" action="https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/">
            ${formInputs}
          </form>
        </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("JazzCash Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
}
