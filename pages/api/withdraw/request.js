export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const { user_id, amount, method, bank_name, account } = req.body;

  // Basic validation
  if (!user_id || !amount || !method || !account) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  // Extra validation for bank transfer
  if (method === "bank" && !bank_name) {
    return res.status(400).json({
      success: false,
      message: "Bank name is required for bank transfer"
    });
  }

  // Example merchant balance (temporary until database added)
  const merchantBalance = 250000;

  if (Number(amount) > merchantBalance) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance"
    });
  }

  // Log request (temporary storage)
  console.log("Withdraw Request:", {
    user_id,
    amount,
    method,
    bank_name: method === "bank" ? bank_name : null,
    account,
    created_at: new Date()
  });

  return res.status(200).json({
    success: true,
    message: "Withdraw request submitted successfully"
  });

}
