import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  const { data, error } = await supabase
    .from("orders")
    .select("amount")
    .eq("status", "PAID");

  if (error) {
    return res.status(500).json({ error: "Database error" });
  }

  let total = 0;

  data.forEach(order => {
    total += Number(order.amount);
  });

  res.status(200).json({
    balance: total
  });

}
