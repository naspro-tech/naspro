import { easypayFetch } from "./_utils";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const {
    orderId,
    transactionAmount,
    mobileAccountNo,
    emailAddress,
    optional1,
  } = req.body;

  try {
    const payload = {
      storeId: process.env.EASYPAY_STORE_ID,
      orderId,
      transactionAmount,
      mobileAccountNo,
      emailAddress,
      optional1,
    };

    const data = await easypayFetch("initiate-ma-transaction", payload);
    console.log("Easypay initiate-ma response:", data);

    return res.status(200).json(data);
  } catch (err) {
    console.error("initiate-ma error:", err);
    return res.status(500).json({ error: err.message });
  }
}
