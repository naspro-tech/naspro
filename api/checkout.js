import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const returnUrl = process.env.JAZZCASH_RETURN_URL;

  const date = new Date();
  const pp_TxnDateTime = date
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .substring(0, 14);
  const pp_TxnExpiryDateTime = new Date(date.getTime() + 60 * 60 * 1000) // +1h
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .substring(0, 14);
  const pp_TxnRefNo = "T" + Date.now();

  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_TxnRefNo,
    pp_Amount: "3000000", // 3000 * 100
    pp_DiscountedAmount: "",
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime,
    pp_TxnExpiryDateTime,
    pp_BillReference: "BillRef",
    pp_Description: "Test Payments",
    pp_CNIC: "345678",
    pp_MobileNumber: "03123456789",
    pp_ReturnURL: returnUrl,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  // Build secure hash string
  function buildHashString(data, salt) {
    const keys = Object.keys(data).filter((k) => k !== "pp_SecureHash").sort();
    let str = salt;
    for (const k of keys) {
      if (data[k] !== "") {
        str += "&" + data[k]; // append values only
      }
    }
    return str;
  }

  const hashString = buildHashString(payload, integritySalt);
  const pp_SecureHash = crypto
    .createHmac("sha256", integritySalt)
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  payload.pp_SecureHash = pp_SecureHash;

  // Send to JazzCash sandbox
  try {
    const response = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    return res.status(200).json({ sentPayload: payload, apiResponse: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
