// /api/thankyou.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const responseData = req.body;

  if (!responseData || !responseData.pp_SecureHash) {
    return res.status(400).json({ error: "Invalid JazzCash response" });
  }

  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;

  // Extract received secure hash
  const receivedHash = responseData.pp_SecureHash;

  // Recalculate hash from response data
  const { canonicalString, hash: calculatedHash } = generateSecureHash(
    responseData,
    INTEGRITY_SALT
  );

  console.log("DEBUG RESPONSE Canonical String:\n", canonicalString);
  console.log("Calculated Hash:", calculatedHash);
  console.log("Received Hash:  ", receivedHash);

  const isValidHash = receivedHash === calculatedHash;

  return res.status(200).json({
    isValidHash,
    receivedHash,
    calculatedHash,
    responseData,
  });
}

// Generate HMAC-SHA256 secure hash for verification
function generateSecureHash(data, salt) {
  const keys = Object.keys(data)
    .filter((k) => data[k] !== "" && k !== "pp_SecureHash")
    .sort();

  const canonicalString = keys.map((k) => data[k]).join("&");
  const message = salt + "&" + canonicalString;

  const hash = crypto
    .createHmac("sha256", salt)
    .update(message)
    .digest("hex")
    .toUpperCase();

  return { canonicalString: message, hash };
}
