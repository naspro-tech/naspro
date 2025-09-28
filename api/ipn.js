import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2";

function createJazzCashHash(params) {
  const keys = Object.keys(params)
    .filter(k => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();

  const valuesString = keys.map(k => params[k]).join("&");
  const hashString = `${INTEGRITY_SALT}&${valuesString}`;
  const hmac = createHmac("sha256", INTEGRITY_SALT);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const data = req.body;
    const receivedHash = data.pp_SecureHash;
    const calculatedHash = createJazzCashHash(data);

    if (receivedHash !== calculatedHash) return res.status(400).json({ message: "Invalid secure hash" });

    const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMessage, pp_Amount } = data;
    const success = pp_ResponseCode === "000" || pp_ResponseCode === "121";

    console.log(`IPN: Ref=${pp_TxnRefNo}, Code=${pp_ResponseCode}, Msg=${pp_ResponseMessage}, Amt=${pp_Amount}`);
    return res.status(200).json({ success, transactionStatus: success ? "success" : "failed" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
