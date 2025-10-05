import { easypayFetch } from "./_utils";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { orderId } = req.body;

  try {
    const payload = {
      storeId: process.env.EASYPAY_STORE_ID,
      orderId,
    };

    const data = await easypayFetch("inquire-transaction", payload);
    console.log("Easypay inquire response:", data);

    return res.status(200).json(data);
  } catch (err) {
    console.error("inquire error:", err);
    return res.status(500).json({ error: err.message });
  }
}
