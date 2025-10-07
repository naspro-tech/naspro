import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "nasprodb";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, amount, service, mobile, merchant, payment_method, partner } = req.body;

    if (!orderId || !amount || !partner) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedPartners = ["betjee", "naspro"];
    if (!allowedPartners.includes(partner.toLowerCase())) {
      return res.status(403).json({ error: "Invalid partner key" });
    }

    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection("transactions");

    const transaction = {
      orderId,
      amount: Number(amount),
      service: service || "Unknown",
      mobile: mobile || "N/A",
      merchant: merchant || partner.toUpperCase(),
      payment_method: payment_method || "Easypaisa",
      partner: partner.toLowerCase(),
      status: "Success",
      createdAt: new Date(),
    };

    await collection.insertOne(transaction);

    return res.status(200).json({ success: true, message: "Transaction saved successfully" });
  } catch (error) {
    console.error("Error saving transaction:", error);
    return res.status(500).json({ success: false, error: "Failed to save transaction" });
  }
}
