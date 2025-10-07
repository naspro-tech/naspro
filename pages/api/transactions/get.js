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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { partner, page = 1, limit = 10, startDate, endDate } = req.query;

  if (!partner) {
    return res.status(400).json({ error: "Partner key required" });
  }

  const allowedPartners = ["betjee", "naspro"];
  if (!allowedPartners.includes(partner.toLowerCase())) {
    return res.status(403).json({ error: "Invalid partner key" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection("transactions");

    const query = { partner: partner.toLowerCase() };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalCount = await collection.countDocuments(query);
    const totalAmountResult = await collection
      .aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      transactions,
      totalCount,
      totalAmount: totalAmountResult[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
      }
