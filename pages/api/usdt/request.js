import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ success:false, message:"Method not allowed" });
  }

  try {

    const { amount, wallet } = req.body;

    if (!amount || !wallet) {
      return res.status(400).json({
        success:false,
        message:"Amount and wallet are required"
      });
    }

    // get paid orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("amount")
      .eq("status","PAID");

    if (ordersError) {
      return res.status(500).json({ error: ordersError.message });
    }

    let ordersTotal = 0;
    (orders || []).forEach(o=>{
      ordersTotal += Number(o.amount);
    });

    // get existing requests
    const { data: requests, error: reqError } = await supabase
      .from("usdt_requests")
      .select("amount")
      .in("status",["PENDING","APPROVED"]);

    if (reqError) {
      return res.status(500).json({ error: reqError.message });
    }

    let requestTotal = 0;
    (requests || []).forEach(r=>{
      requestTotal += Number(r.amount);
    });

    const balance = ordersTotal - requestTotal;

    if (Number(amount) > balance) {
      return res.status(400).json({
        success:false,
        message:"Insufficient balance"
      });
    }

    // save request
    const { error: insertError } = await supabase
      .from("usdt_requests")
      .insert([
        {
          amount: Number(amount),
          wallet,
          status: "PENDING"
        }
      ]);

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({
      success:true,
      message:"Request submitted"
    });

  } catch (error) {

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }
}
