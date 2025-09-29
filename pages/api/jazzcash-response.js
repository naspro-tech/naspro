// /pages/api/jazzcash-response.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const integrity_salt = 1g90sz31w2;
    if (!integrity_salt) {
      throw new Error("Integrity Salt missing in environment variables");
    }

    const response = req.body;
    console.log("🎯 JazzCash Response:", response);

    const receivedHash = response.pp_SecureHash;

    // Remove SecureHash for verification
    const { pp_SecureHash, ...withoutHash } = response;

    // Build string for hash validation
    const sortedKeys = Object.keys(withoutHash).sort();
    let hashString = integrity_salt;
    sortedKeys.forEach((key) => {
      if (withoutHash[key] !== "") hashString += "&" + withoutHash[key];
    });

    const calculatedHash = crypto
      .createHmac("sha256", integrity_salt)
      .update(hashString)
      .digest("hex");

    if (receivedHash !== calculatedHash) {
      console.error("❌ Hash mismatch:", { receivedHash, calculatedHash });
      return res.redirect(
        302,
        `/payment?error=Security verification failed`
      );
    }

    // Hash OK, now check payment response
    if (response.pp_ResponseCode === "000") {
      const amount = parseInt(response.pp_Amount, 10) / 100;
      const service = response.pp_BillReference.replace("naspro_", "");
      const txnId = response.pp_TxnRefNo;

      return res.redirect(
        302,
        `/thankyou?service=${service}&amount=${amount}&payment_method=JazzCash&transaction_id=${txnId}&status=success`
      );
    } else {
      console.error("❌ Payment Failed:", response.pp_ResponseMessage);
      return res.redirect(
        302,
        `/payment?error=${encodeURIComponent(
          response.pp_ResponseMessage
        )}&error_code=${response.pp_ResponseCode}`
      );
    }
  } catch (error) {
    console.error("⚠️ JazzCash Response Error:", error);
    return res.redirect(
      302,
      `/payment?error=${encodeURIComponent("Server error: " + error.message)}`
    );
  }
}
