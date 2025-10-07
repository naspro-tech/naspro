import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "nasprodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { merchant, page = 1, limit = 10, startDate, endDate } = req.query;

  if (!merchant) {
    return res.status(400).json({ error: "Merchant name required" });
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("transactions");

    const partner = merchant.trim().toLowerCase();

    const query = { merchant: partner };

    // Optional date filter
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
    const totalAmountAgg = await collection
      .aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      transactions,
      totalCount,
      totalAmount: totalAmountAgg[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  } finally {
    await client.close();
  }
}
  
