// /pages/api/jazzcash_payment.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, description, mobileNumber } = req.body;

  // Hardcoded sandbox credentials for testing
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const salt = "z60gb5u008";
  const returnUrl = "https://naspropvt.vercel.app/api/jazzcash_response";

  // Generate transaction details
  const now = new Date();
  const pp_TxnDateTime = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const expiryDate = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
  const pp_TxnExpiryDateTime = expiryDate.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const pp_TxnRefNo = 'T' + pp_TxnDateTime;

  // Convert amount to paisa
  const tempAmount = amount * 100;
  const pp_Amount = Math.floor(tempAmount).toString();

  // Prepare payload for JazzCash hosted payment form
  const payload = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo: pp_TxnRefNo,
    pp_Amount: pp_Amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: pp_TxnDateTime,
    pp_BillReference: "billRef",
    pp_Description: description ? description.substring(0, 200) : "Transaction",
    pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
    pp_ReturnURL: returnUrl,
    pp_SecureHash: "",
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
    pp_MobileNumber: mobileNumber,
  };

  // Generate secure hash
  const hashData = { ...payload };
  delete hashData.pp_SecureHash;
  Object.keys(hashData).forEach(key => {
    if (hashData[key] === "") delete hashData[key];
  });

  const sortedKeys = Object.keys(hashData).sort();
  const hashValues = sortedKeys.map(key => hashData[key]);
  const hashString = salt + "&" + hashValues.join("&");
  const secureHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();
  payload.pp_SecureHash = secureHash;

  // Automatically generate a form to redirect the user to JazzCash hosted payment page
  const formInputs = Object.keys(payload)
    .map(key => `<input type="hidden" name="${key}" value="${payload[key]}"/>`)
    .join("\n");

  const htmlForm = `
    <html>
      <body>
        <form id="jazzcashForm" action="https://sandbox.jazzcash.com.pk/CustomerPortal/Transactionmanagement/merchantform/" method="post">
          ${formInputs}
        </form>
        <script>document.getElementById('jazzcashForm').submit();</script>
      </body>
    </html>
  `;

  // Send the HTML form as response to redirect user
  res.status(200).send(htmlForm);
}
