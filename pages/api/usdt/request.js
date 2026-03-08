import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {

    const { amount, wallet } = req.body;

    // validation
    if (!amount || !wallet) {
      return res.status(400).json({
        success: false,
        message: "Amount and wallet are required"
      });
    }

    const requestAmount = Number(amount);

    if (requestAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    /* ---------------------------
       GET TOTAL PAID ORDERS
    ---------------------------- */

    let ordersTotal = 0;

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("amount")
      .eq("status", "PAID");

    if (ordersError) {
      console.error("Orders error:", ordersError);
      return res.status(500).json({
        success: false,
        message: "Failed to load orders"
      });
    }

    (orders || []).forEach(o => {
      ordersTotal += Number(o.amount || 0);
    });

    /* ---------------------------
       GET WITHDRAW REQUESTS
    ---------------------------- */

    let requestTotal = 0;

    const { data: requests, error: reqError } = await supabase
      .from("usdt_requests")
      .select("amount")
      .in("status", ["PENDING", "APPROVED"]);

    if (reqError) {
      console.error("Request error:", reqError);
      return res.status(500).json({
        success: false,
        message: "Failed to load withdrawal requests"
      });
    }

    (requests || []).forEach(r => {
      requestTotal += Number(r.amount || 0);
    });

    /* ---------------------------
       CALCULATE BALANCE
    ---------------------------- */

    const balance = ordersTotal - requestTotal;

    if (requestAmount > balance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    /* ---------------------------
       SAVE REQUEST
    ---------------------------- */

    const { error: insertError } = await supabase
      .from("usdt_requests")
      .insert([
        {
          amount: requestAmount,
          wallet: wallet.trim(),
          status: "PENDING"
        }
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to save request"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request submitted"
    });

  } catch (error) {

    console.error("API crash:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

    }
