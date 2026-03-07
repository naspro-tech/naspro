import supabase from "../../../lib/supabase";

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: "Order ID required" });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) {
    return res.status(500).json({ error: "Order not found" });
  }

  res.status(200).json(data);
}
