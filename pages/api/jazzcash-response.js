// /pages/api/jazzcash-response.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const integrity_salt = "1g90sz31w2";
    const response = req.body;
    const receivedHash = response.pp_SecureHash;

    // Build hash string in the same order JazzCash expects
    let hashString = integrity_salt + "&";
    hashString +=
      (response.pp_Amount || "") +
      "&" +
      (response.pp_BillReference || "") +
      "&" +
      (response.pp_Description || "") +
      "&" +
      (response.pp_Language || "") +
      "&" +
      (response.pp_MerchantID || "") +
      "&" +
      (response.pp_Password || "") +
      "&" +
      (response.pp_ReturnURL || "") +
      "&" +
      (response.pp_SubMerchantID || "") +
      "&" +
      (response.pp_TxnCurrency || "") +
      "&" +
      (response.pp_TxnDateTime || "") +
      "&" +
      (response.pp_TxnExpiryDateTime || "") +
      "&" +
      (response.pp_TxnRefNo || "") +
      "&" +
      (response.pp_TxnType || "") +
      "&" +
      (response.pp_Version || "") +
      "&" +
      (response.ppmpf_1 || "") +
      "&" +
      (response.ppmpf_2 || "") +
      "&" +
      (response.ppmpf_3 || "") +
      "&" +
      (response.ppmpf_4 || "") +
      "&" +
      (response.ppmpf_5 || "");

    const calculatedHash = crypto
      .createHmac("sha256", integrity_salt)
      .update(hashString)
      .digest("hex");

    if (receivedHash === calculatedHash) {
      const responseCode = response.pp_ResponseCode;

      if (responseCode === "000") {
        // ✅ Payment successful
        const amount = response.pp_Amount / 100; // convert back from paisa
        const service = response.pp_BillReference.replace("naspro_", "");

        return res.redirect(
          302,
          `/thankyou?service=${service}&amount=${amount}&payment_method=jazzcash&status=success&transaction_id=${response.pp_TxnRefNo}`
        );
      } else {
        // ❌ Payment failed
        return res.redirect(
          302,
          `/payment?error=Payment failed: ${response.pp_ResponseMessage}&error_code=${responseCode}`
        );
      }
    } else {
      // ❌ Hash mismatch = security error
      return res.redirect(
        302,
        "/payment?error=Security error: Invalid payment response"
      );
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
