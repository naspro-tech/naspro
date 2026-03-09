import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  try {

    // 1️⃣ Paid Orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("amount")
      .eq("status","PAID");

    if (ordersError) {
      return res.status(500).json({
        success:false,
        message:"Orders query failed"
      });
    }

    let ordersTotal = 0;

    (orders || []).forEach(o=>{
      ordersTotal += Number(o.amount);
    });

    // 2️⃣ USDT Withdraw Requests
    const { data: usdt, error: usdtError } = await supabase
      .from("usdt_requests")
      .select("amount")
      .in("status",["PENDING","APPROVED"]);

    if (usdtError) {
      return res.status(500).json({
        success:false,
        message:"USDT query failed"
      });
    }

    let usdtTotal = 0;

    (usdt || []).forEach(r=>{
      usdtTotal += Number(r.amount);
    });

    // 3️⃣ Player Withdraw Requests
    const { data: withdraws, error: withdrawError } = await supabase
      .from("withdraw_requests")
      .select("amount")
      .in("status",["PENDING","APPROVED"]);

    if (withdrawError) {
      return res.status(500).json({
        success:false,
        message:"Withdraw query failed"
      });
    }

    let withdrawTotal = 0;

    (withdraws || []).forEach(w=>{
      withdrawTotal += Number(w.amount);
    });

    // 4️⃣ Final Balance
    const balance = ordersTotal - usdtTotal - withdrawTotal;

    return res.status(200).json({
      success:true,
      balance
    });

  } catch(err){

    return res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

}
