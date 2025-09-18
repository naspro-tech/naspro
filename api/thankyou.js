// /api/thankyou.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const response = req.body;

  if (!response || typeof response !== "object") {
    return res.status(400).json({ error: "Invalid response format" });
  }

  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;

  // Extract JazzCash secure hash from response
  const receivedHash = response.pp_SecureHash;
  delete response.pp_SecureHash;

  // Recalculate secure hash
  const calculatedHash = generateSecureHash(response, INTEGRITY_SALT);

  // Debug logs
  console.log("DEBUG RESPONSE HASH STRING:", buildHashString(response, INTEGRITY_SALT));
  console.log("JazzCash Response SecureHash:", receivedHash);
  console.log("Our Calculated SecureHash:", calculatedHash);

  // Validate hash
  if (receivedHash !== calculatedHash) {
    return res.status(400).json({ error: "Invalid SecureHash. Possible tampering detected." });
  }

  // Check CNIC format (sandbox requires last 6 digits only)
  if (response.pp_CNIC && !/^\d{6}$/.test(response.pp_CNIC)) {
    return res.status(400).json({ error: "Invalid CNIC format in response" });
  }

  // Check payment response code
  if (response.pp_ResponseCode === "000" && response.pp_PaymentResponseCode === "000") {
    return res.status(200).json({ message: "Payment Successful", data: response });
  } else {
    return res.status(200).json({
      message: "Payment Failed or Pending",
      responseCode: response.pp_ResponseCode,
      paymentResponseCode: response.pp_PaymentResponseCode,
      data: response,
    });
  }
}

// Build hash string for debug (alphabetical order)
function buildHashString(data, salt) {
  const keys = Object.keys(data)
    .filter((k) => data[k] !== "" && data[k] !== null && k.startsWith("pp_"))
    .sort();

  let str = salt;
  keys.forEach((k) => {
    str += "&" + data[k];
  });

  return str;
}

// Generate SHA256 secure hash
function generateSecureHash(data, salt) {
  const hashString = buildHashString(data, salt);
  return crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();
}
