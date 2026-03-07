export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Example merchant balance
  const merchantBalance = 250000;

  if (Number(amount) > merchantBalance) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance"
    });
  }

  console.log("USDT Request:", {
    amount,
    wallet,
    created_at: new Date()
  });

  return res.status(200).json({
    success: true
  });

}
