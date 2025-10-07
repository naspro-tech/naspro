// /pages/api/transactions/add.js
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    const {
      orderId,
      service,
      amount,
      payment_method,
      transaction_id,
      phone,
      email,
      name,
      cnic,
      description,
      status,
      secretWord,
    } = req.body;

    if (!orderId || !amount || !secretWord) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTxn = await Transaction.create({
      orderId,
      service,
      amount,
      payment_method,
      transaction_id,
      phone,
      email,
      name,
      cnic,
      description,
      status: status || "pending",
      secretWord,
    });

    return res.status(200).json({ success: true, transaction: newTxn });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
