import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { txnRefNo } = req.body;
  if (!txnRefNo) {
    return res.status(400).json({ error: "Missing txnRefNo" });
  }

  const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID || "MC302132";
  const PASSWORD = process.env.JAZZCASH_PASSWORD || "53v2z2u302";
  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT || "z60gb5u008";

  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: MERCHANT_ID,
    pp_Password: PASSWORD,
    pp_TxnRefNo: txnRefNo,
    pp_TxnCurrency: "PKR",
  };

  payload.pp_SecureHash = generateSecureHash(payload, INTEGRITY_SALT);

  console.log("STATUS INQUIRY HASH STRING:", buildHashString(payload));
  console.log("STATUS INQUIRY HASH:", payload.pp_SecureHash);

  try {
    const response = await fetch(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return res.status(200).json({ sentPayload: payload, apiResponse: result });
  } catch (err) {
    console.error("JazzCash Inquiry API Error:", err);
    return res.status(500).json({ error: "Inquiry request failed. Please try again later." });
  }
}

function buildHashString(data) {
  return Object.keys(data)
    .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash")
    .sort()
    .map((k) => (data[k] === undefined ? "" : String(data[k])))
    .join("&");
}

function generateSecureHash(data, salt) {
  const hashString = salt + "&" + buildHashString(data);
  return crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();
}
