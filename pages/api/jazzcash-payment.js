      // pages/api/jazzcash-payment.js
import moment from "moment-timezone";
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST method." });
  }

  const { amount, orderId, description } = req.body;

  // 🔑 JazzCash credentials (hardcoded for now)
  const merchantId = "MC339532";
  const password = "2282sxh9z8";
  const integritySalt = "1g90sz31w2";
  const returnUrl = "https://naspro-nine.vercel.app/api/jazzcash-response";

  // JazzCash requires amount in lowest unit (PKR * 100)
  const pp_Amount = (parseFloat(amount) * 100).toString();
  const pp_TxnDateTime = moment().tz("Asia/Karachi").format("YYYYMMDDHHmmss");
  const pp_TxnExpiryDateTime = moment().tz("Asia/Karachi").add(1, "days").format("YYYYMMDDHHmmss");
  const pp_TxnRefNo = `T${pp_TxnDateTime}`;

  const transactionData = {
    pp_Version: "1.1",
    pp_TxnType: "",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo,
    pp_Amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime,
    pp_TxnExpiryDateTime,
    pp_BillReference: orderId || "billRef",
    pp_Description: description || "Service payment",
    pp_ReturnURL: returnUrl,
    pp_SecureHash: "",
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
  };

  // 🔐 Build secure hash string
  const hashString =
    integritySalt +
    "&" +
    Object.values(transactionData)
      .filter((val) => val !== "")
      .join("&");

  const secureHash = crypto
    .createHmac("sha256", integritySalt)
    .update(hashString)
    .digest("hex");

  transactionData.pp_SecureHash = secureHash;

  // 🔀 Respond with auto-submit form to JazzCash
  res.setHeader("Content-Type", "text/html");

  const formInputs = Object.entries(transactionData)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
    .join("");

  res.send(`
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/">
          ${formInputs}
        </form>
      </body>
    </html>
  `);
}
