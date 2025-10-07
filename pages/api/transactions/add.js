// /pages/api/transactions/add.js
import clientPromise from "../../lib/mongodb.js";
import Transaction from "../../models/Transaction.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("nasprodb");

    const {
      orderId,
      service,
      amount,
      payment_method,
      transaction_id,
      name,
      email,
      phone,
      cnic,
      description,
      secretWord, // ✅ comes from hosted page
      status = "Pending",
    } = req.body;

    if (!secretWord) {
      return res.status(400).json({ success: false, error: "Missing secretWord" });
    }

    const transaction = {
      orderId,
      service,
      amount,
      payment_method,
      transaction_id,
      name,
      email,
      phone,
      cnic: cnic || null,
      description,
      secretWord,
      status,
      createdAt: new Date(),
    };

    await db.collection("transactions").insertOne(transaction);

    return res.status(200).json({
      success: true,
      message: "Transaction stored successfully",
      transaction,
    });
  } catch (error) {
    console.error("Transaction save error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
