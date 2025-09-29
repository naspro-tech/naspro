// /pages/api/jazzcash-response.js
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: true, // Make sure Next.js parses POST body
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const integrity_salt = "1g90sz31w2"; // ⚠️ move to process.env in production

    const response = req.body || {};
    const receivedHash = response.pp_SecureHash;

    if (!receivedHash) {
      console.error("❌ Missing pp_SecureHash in response");
      return res.redirect(302, "/payment?error=Missing secure hash");
    }

    // Remove hash before verifying
    const responseWithoutHash = { ...response };
    delete responseWithoutHash.pp_SecureHash;

    // Sort keys and build hash string
    const sortedKeys = Object.keys(responseWithoutHash).sort();
    const hashString =
      integrity_salt + "&" + sortedKeys.map((k) => responseWithoutHash[k]).join("&");

    const calculatedHash = crypto
      .createHmac("sha256", integrity_salt)
      .update(hashString)
      .digest("hex");

    if (receivedHash !== calculatedHash) {
      console.error("❌ Secure hash mismatch");
      return res.redirect(302, "/payment?error=Security error: Invalid payment response");
    }

    // ✅ Hash verified
    const responseCode = response.pp_ResponseCode;

    if (responseCode === "000") {
      // Payment successful
      const amount = (parseInt(response.pp_Amount, 10) || 0) / 100; // convert paisa → PKR
      const service = (response.pp_BillReference || "").replace("naspro_", "");
      const txnId = response.pp_TxnRefNo;

      console.log("✅ Payment Success:", { service, amount, txnId });

      return res.redirect(
        302,
        `/thankyou?service=${service}&amount=${amount}&payment_method=jazzcash&status=success&transaction_id=${txnId}`
      );
    } else {
      // Payment failed
      const errorMsg = response.pp_ResponseMessage || "Unknown error";
      console.error("❌ Payment Failed:", errorMsg);

      return res.redirect(
        302,
        `/payment?error=${encodeURIComponent("Payment failed: " + errorMsg)}&error_code=${responseCode}`
      );
    }
  } catch (error) {
    console.error("❌ JazzCash response handler error:", error);
    return res.redirect(
      302,
      "/payment?error=" + encodeURIComponent("Internal error: " + error.message)
    );
  }
}
  
