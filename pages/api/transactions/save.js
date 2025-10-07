import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "nasprodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, amount, service, mobile, merchant, payment_method } = req.body;

    if (!orderId || !amount || !merchant) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("transactions");

    const transaction = {
      orderId,
      amount: Number(amount),
      service: service || "Unknown",
      mobile: mobile || "N/A",
      merchant,
      payment_method: payment_method || "Easypaisa",
      status: "Success",
      createdAt: new Date(),
    };

    await collection.insertOne(transaction);

    return res.status(200).json({ success: true, message: "Transaction saved successfully" });
  } catch (error) {
    console.error("Error saving transaction:", error);
    return res.status(500).json({ success: false, error: "Failed to save transaction" });
  } finally {
    await client.close();
  }
}
