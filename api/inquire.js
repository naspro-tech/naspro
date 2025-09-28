// /api/inquire.js
import { createHmac } from "crypto";

const INTEGRITY_SALT = "1g90sz31w2";

function createJazzCashHash(params, integritySalt) {
  const keys = Object.keys(params)
    .filter((k) => k.startsWith("pp_") && k !== "pp_SecureHash" && params[k])
    .sort();
  const valuesString = keys.map((k) => params[k]).join("&");
  return createHmac("sha256", integritySalt).update(`${integritySalt}&${valuesString}`, "utf8").digest("hex").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const data = req.body;
    data.pp_SecureHash = createJazzCashHash(data, INTEGRITY_SALT);

    // Send request to JazzCash Inquiry API
    // const response = await fetch(JAZZCASH_INQUIRY_URL, { method: "POST", body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });

    return res.status(200).json({ success: true, inquiryRequest: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
