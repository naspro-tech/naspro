import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { service_key, name, email, phone, description, cnic } = req.body;

  if (!service_key || !name || !email || !phone || !description || !cnic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Pricing
  const servicePrices = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const amountPKR = servicePrices[service_key];
  if (!amountPKR || amountPKR === 0) {
    return res.status(400).json({ error: 'Invalid or zero-price service selected' });
  }

  const merchantId = "MC302132";          // Your test Merchant ID
  const password = "53v2z2u302";           // Password from JazzCash Sandbox
  const integritySalt = "z60gb5u008";      // Integrity Salt = HASH KEY
  // const returnUrl = "https://naspropvt.vercel.app/api/thankyou"; // Not used in REST, but keep for record

  // Timestamps
  const txnRefNo = Date.now().toString();  // Unique numeric string
  const now = new Date();
  const txnDateTime = formatDate(now);
  const expiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // +1 day

  // Prepare data payload
  const payload = {
  pp_Version: "2.0",
  pp_TxnType: "MWALLET",
  pp_Language: "EN",
  pp_MerchantID: merchantId,
  pp_Password: password,
  pp_TxnRefNo: txnRefNo,
  pp_Amount: String(amountPKR * 100),
  pp_TxnCurrency: "PKR",
  pp_TxnDateTime: txnDateTime,
  pp_TxnExpiryDateTime: expiryDateTime,
  pp_BillReference: `BillRef${txnRefNo}`,  // This line
  pp_Description: description,
  pp_CNIC: cnic,
  pp_MobileNumber: phone,
  ppmpf_1: name,
  ppmpf_2: email,
  ppmpf_3: service_key,
  ppmpf_4: "",
  ppmpf_5: ""
};
