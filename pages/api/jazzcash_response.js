import crypto from "crypto";

export default function handler(req, res) {
  if(req.method!=="POST") return res.status(405).json({ error:"Method not allowed" });

  const responseData = req.body;
  const salt = "z60gb5u008";

  try {
    const receivedHash = responseData.pp_SecureHash;
    const verifyData = {...responseData};
    delete verifyData.pp_SecureHash;
    Object.keys(verifyData).forEach(k=>{ if(verifyData[k]==="") delete verifyData[k]; });
    const sortedKeys = Object.keys(verifyData).sort();
    const hashString = salt + "&" + sortedKeys.map(k=>verifyData[k]).join("&");
    const calculatedHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();

    let result = {};
    if(receivedHash === calculatedHash){
      result = {
        success: responseData.pp_ResponseCode==="000",
        orderId: responseData.pp_TxnRefNo,
        transaction_id: responseData.pp_RetreivalReferenceNo || responseData.pp_TxnRefNo,
        amount: responseData.pp_Amount/100,
        responseCode: responseData.pp_ResponseCode,
        responseMessage: responseData.pp_ResponseMessage,
        payment_method: "JazzCash",
        bankTransactionId: responseData.pp_RetreivalReferenceNo || ""
      };
    } else {
      result = { success:false, error:"Hash verification failed", responseData };
    }

    // Return JSON array/object
    res.status(200).json(result);
  } catch(err) {
    console.error(err);
    res.status(500).json({ success:false, error:"Payment processing error", details:err.message });
  }
}
