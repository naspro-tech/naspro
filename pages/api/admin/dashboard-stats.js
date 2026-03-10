export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ success:false });
  }

  try {

    /*
    In future these values should come from database.
    For now we simulate them.
    */

    const totalBalance = 0; // SUM of all merchant balances

    // Same Easypaisa fee used in merchant wallet
    const fee = totalBalance * 0.00986;

    const settledAmount = totalBalance - fee;

    const pendingWithdraws = 0; // COUNT withdraw requests where status = pending

    const usdtRequests = 0; // COUNT USDT requests where status = pending


    res.status(200).json({
      success:true,
      totalBalance,
      settledAmount,
      pendingWithdraws,
      usdtRequests
    });

  } catch (error) {

    console.error("Admin stats error:", error);

    res.status(500).json({
      success:false
    });

  }

}
