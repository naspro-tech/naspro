import crypto from "crypto";

export default function handler(req, res) {
  const { service } = req.query;

  const services = {
    webdev: { name: "Web Development", price: 30000 },
    logo: { name: "Logo Design", price: 5000 },
    ecommerce: { name: "E-Commerce Store", price: 50000 }
  };

  if (!services[service]) {
    res.status(400).send("Invalid service");
    return;
  }

  const merchantID = "MC152724";
  const password = "00v8sc695t";
  const integritySalt = "221sb04w9x";
  const item = services[service];

  const amount = item.price * 100; // JazzCash expects paisa
  const datetime = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0,14);
  const expiry = new Date(Date.now() + 60*60*1000).toISOString().replace(/[-:T.Z]/g, "").slice(0,14);
  const txnRef = "T" + Date.now();

  const payload = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantID,
    pp_Password: password,
    pp_TxnRefNo: txnRef,
    pp_Amount: amount.toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: datetime,
    pp_BillReference: service,
    pp_Description: "Payment for " + item.name,
    pp_TxnExpiryDateTime: expiry,
    pp_ReturnURL: "https://naspro-payments.vercel.app/api/thankyou",
  };

  const order = Object.keys(payload);
  let hashString = integritySalt;
  for (const key of order) {
    const val = payload[key];
    if (val !== "") hashString += "&" + val;
  }
  const hash = crypto.createHmac("sha256", integritySalt).update(hashString).digest("hex");
  payload.pp_SecureHash = hash;

  let form = `<form id="payForm" method="post" action="https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform">`;
  for (const [key, value] of Object.entries(payload)) {
    form += `<input type="hidden" name="${key}" value="${value}" />`;
  }
  form += `</form><script>document.getElementById('payForm').submit();</script>`;

  res.setHeader("Content-Type", "text/html");
  res.send(form);
}
