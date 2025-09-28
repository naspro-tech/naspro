// /api/thankyou.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2";

function createJazzCashHash(params, integritySalt) {
  const keys = Object.keys(params)
    .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k])
    .sort();
  const valuesString = keys.map((k) => params[k]).join("&");
  return createHmac("sha256", integritySalt).update(`${integritySalt}&${valuesString}`, "utf8").digest("hex").toUpperCase();
}

export default function handler(req, res) {
  const data = req.method === "POST" ? req.body : req.query;
  const receivedHash = data.pp_SecureHash;
  const generatedHash = createJazzCashHash(data, INTEGRITY_SALT);

  if (receivedHash !== generatedHash) return res.status(400).json({ message: "Invalid secure hash" });

  const success = data.pp_ResponseCode === "000" || data.pp_ResponseCode === "121";
  return res.status(200).json({
    success,
    transactionId: data.pp_TxnRefNo,
    retrievalReferenceNo: data.pp_RetreivalReferenceNo,
    amount: parseInt(data.pp_Amount) / 100,
    message: data.pp_ResponseMessage,
  });
}
