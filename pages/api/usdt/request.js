import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ success:false, message:"Method not allowed" });
  }

  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({
      success:false,
      message:"Amount and wallet are required"
    });
  }

  // 1️⃣ Get total paid orders
  const { data: orders } = await supabase
    .from("orders")
    .select("amount")
    .eq("status","PAID");

  let ordersTotal = 0;

  orders.forEach(o=>{
    ordersTotal += Number(o.amount);
  });

  // 2️⃣ Get existing USDT requests
  const { data: requests } = await supabase
    .from("usdt_requests")
    .select("amount")
    .in("status",["PENDING","APPROVED"]);

  let requestTotal = 0;

  requests.forEach(r=>{
    requestTotal += Number(r.amount);
  });

  const balance = ordersTotal - requestTotal;

  // 3️⃣ Check balance
  if (Number(amount) > balance) {
    return res.status(400).json({
      success:false,
      message:"Insufficient balance"
    });
  }

  // 4️⃣ Insert request
  const { error } = await supabase
    .from("usdt_requests")
    .insert([
      {
        amount:Number(amount),
        wallet,
        status:"PENDING",
        proof_1:null,
        proof_2:null,
        created_at:new Date()
      }
    ]);

  if (error) {
    return res.status(500).json({
      success:false,
      message:"Database error"
    });
  }

  return res.status(200).json({
    success:true,
    message:"USDT request submitted successfully"
  });

}
