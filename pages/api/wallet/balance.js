import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  // 1️⃣ Get total paid orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("amount")
    .eq("status", "PAID");

  if (ordersError) {
    return res.status(500).json({ error: "Orders query failed" });
  }

  let ordersTotal = 0;

  orders.forEach(order => {
    ordersTotal += Number(order.amount);
  });

  // 2️⃣ Get total USDT requests (PENDING + APPROVED)
  const { data: requests, error: requestError } = await supabase
    .from("usdt_requests")
    .select("amount")
    .in("status", ["PENDING","APPROVED"]);

  if (requestError) {
    return res.status(500).json({ error: "USDT request query failed" });
  }

  let requestTotal = 0;

  requests.forEach(req => {
    requestTotal += Number(req.amount);
  });

  // 3️⃣ Calculate available balance
  const balance = ordersTotal - requestTotal;

  return res.status(200).json({
    balance
  });

}
