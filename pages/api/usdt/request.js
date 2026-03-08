import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  const { amount, wallet } = req.body;

  // validate fields
  if (!amount || !wallet) {
    return res.status(400).json({
      success:false,
      message:"Amount and wallet are required"
    });
  }

  // get paid orders
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("amount")
    .eq("status","PAID");

  if (orderError) {
    return res.status(500).json({
      success:false,
      message:"Failed to read orders"
    });
  }

  let ordersTotal = 0;

  orders.forEach(o=>{
    ordersTotal += Number(o.amount);
  });

  // get existing USDT requests
  const { data: requests, error: requestError } = await supabase
    .from("usdt_requests")
    .select("amount")
    .in("status",["PENDING","APPROVED"]);

  if (requestError) {
    return res.status(500).json({
      success:false,
      message:"Failed to read requests"
    });
  }

  let requestTotal = 0;

  requests.forEach(r=>{
    requestTotal += Number(r.amount);
  });

  const balance = ordersTotal - requestTotal;

  // insufficient balance check
  if (Number(amount) > balance) {
    return res.status(400).json({
      success:false,
      message:"Insufficient balance"
    });
  }

  // insert request
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
      message:"Failed to save request"
    });
  }

  return res.status(200).json({
    success:true,
    message:"Request submitted successfully"
  });

}
