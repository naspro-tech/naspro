import crypto from "crypto";

export default async function handler(req, res) {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
  const response = req.body; // JazzCash will POST here

  // Recompute secure hash
  function buildHashString(data, salt) {
    const keys = Object.keys(data).filter((k) => k !== "pp_SecureHash").sort();
    let str = salt;
    for (const k of keys) {
      if (data[k] !== "") {
        str += "&" + data[k]; // values only
      }
    }
    return str;
  }

  const recomputed = crypto
    .createHmac("sha256", integritySalt)
    .update(buildHashString(response, integritySalt))
    .digest("hex")
    .toUpperCase();

  const valid = recomputed === response.pp_SecureHash;

  return res.status(200).json({
    received: response,
    recomputed,
    hashValid: valid,
  });
}
