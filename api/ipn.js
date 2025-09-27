// /api/ipn.js - JazzCash IPN Handler (fixed lowercase fields + hash validation)
import crypto from "crypto";

function createJazzCashHash(params, integritySalt) {
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== "")
    .sort();

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${integritySalt}&${valuesString}`;

  const hmac = crypto.createHmac("sha256", integritySalt);
  hmac.update(hashString);
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const responseData = req.body;

    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    if (!integritySalt) {
      return res.status(500).json({ message: "Missing JazzCash integrity salt." });
    }

    const receivedHash = responseData.pp_SecureHash;
    const generatedHash = createJazzCashHash(responseData, integritySalt);

    if (receivedHash !== generatedHash) {
      console.error("❌ Secure Hash Mismatch in IPN");
      return res.status(400).json({ message: "Invalid secure hash" });
    }

    const { pp_txnRefNo, pp_responseCode, pp_responseMessage, pp_amount } = responseData;
    const success = pp_responseCode === "000" || pp_responseCode === "121";

    console.log(`📩 IPN: Ref=${pp_txnRefNo}, Code=${pp_responseCode}, Msg=${pp_responseMessage}, Amt=${pp_amount}`);

    return res.status(200).json({
      success,
      message: "IPN processed",
      transactionStatus: success ? "success" : "failed",
    });
  } catch (error) {
    console.error("IPN API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
