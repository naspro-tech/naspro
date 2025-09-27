// /api/ipn.js - JazzCash IPN Handler (PascalCase fields + hash validation)
import { createHmac } from "crypto";

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

  // Masked log (avoid leaking salt in production)
  console.log("🔑 IPN Hash string (masked):", hashString.replace(integritySalt, "***"));

  const hmac = createHmac("sha256", integritySalt);
  hmac.update(hashString, "utf8");
  const secureHash = hmac.digest("hex").toUpperCase();

  return secureHash;
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

    // ✅ Use correct PascalCase keys (as JazzCash actually sends)
    const {
      pp_TxnRefNo,
      pp_ResponseCode,
      pp_ResponseMessage,
      pp_Amount,
    } = responseData;

    const success = pp_ResponseCode === "000" || pp_ResponseCode === "121";

    console.log(
      `📩 IPN: Ref=${pp_TxnRefNo}, Code=${pp_ResponseCode}, Msg=${pp_ResponseMessage}, Amt=${pp_Amount}`
    );

    return res.status(200).json({
      success,
      message: "IPN processed",
      transactionStatus: success ? "success" : "failed",
    });
  } catch (error) {
    console.error("IPN API error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
  
