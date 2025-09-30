// pages/api/jazzcash-payment.js
import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST method.",
    });
  }

  try {
    console.log("🎯 JazzCash Payment API called");

    // JazzCash credentials (sandbox)
    const merchant_id = "MC339532";
    const password = "2282sxh9z8";
    const integrity_salt = "1g90sz31w2";
    const return_url = "https://naspro-nine.vercel.app/api/jazzcash-response";

    const { amount, description, service } = req.body;

    if (!amount || !service) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: amount and service",
      });
    }

    const order_id = `NASPRO_${Date.now()}`;

    // Helper: format current date as YYYYMMDDHHmmss
    function formatDateTime(date) {
      return date
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(0, 14);
    }

    const now = new Date();
    const txnDateTime = formatDateTime(now);

    // Expiry = +1 day
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const txnExpiryDateTime = formatDateTime(expiryDate);

    // Prepare transaction data
    const transactionData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchant_id,
      pp_Password: password,
      pp_BankID: "TBANK",
      pp_ProductID: "RETL",
      pp_Amount: (amount * 100).toString(), // Paisa
      pp_TxnRefNo: order_id,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_BillReference: `naspro_${service}`.substring(0, 50),
      pp_Description: (description || `Payment for ${service}`).substring(0, 100),
      pp_ReturnURL: return_url,
      ppmpf_1: "1",
      ppmpf_2: "2",
      ppmpf_3: "3",
      ppmpf_4: "4",
      ppmpf_5: "5",
    };

    // Sort keys for hashing
    const sorted = {};
    Object.keys(transactionData)
      .sort()
      .forEach((k) => (sorted[k] = transactionData[k]));

    let hashString = integrity_salt + "&" + Object.values(sorted).join("&");

    const secureHash = crypto
      .createHmac("sha256", integrity_salt)
      .update(hashString)
      .digest("hex");

    transactionData.pp_SecureHash = secureHash;

    // 🔀 Return an auto-submitting HTML form so user goes to JazzCash
    const formHtml = `
      <html>
        <body onload="document.forms[0].submit()">
          <form method="post" action="https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/">
            ${Object.entries(transactionData)
              .map(
                ([k, v]) =>
                  `<input type="hidden" name="${k}" value="${v}" />`
              )
              .join("")}
            <noscript><input type="submit" value="Continue to JazzCash"></noscript>
          </form>
        </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(formHtml);
  } catch (error) {
    console.error("❌ JazzCash API error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
}
      
