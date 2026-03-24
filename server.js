require("dotenv").config();
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";
const PORT = 3069;

const app = express();
app.use(express.static(path.join(__dirname, "public")));

let db;

async function getCollection() {
  if (!db) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db.collection(COLLECTION_NAME);
}

// GET /api/proxies?status=active&type=http&page=1&limit=50
app.get("/api/proxies", async (req, res) => {
  try {
    const col = await getCollection();
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [proxies, total] = await Promise.all([
      col.find(filter).sort({ scrapedAt: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    res.json({ proxies, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
app.get("/api/stats", async (req, res) => {
  try {
    const col = await getCollection();
    const [byType, byStatus, total] = await Promise.all([
      col.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]).toArray(),
      col.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      col.countDocuments(),
    ]);

    const activeByType = await col
      .aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ])
      .toArray();

    res.json({
      total,
      byType: Object.fromEntries(byType.map((r) => [r._id, r.count])),
      byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
      activeByType: Object.fromEntries(activeByType.map((r) => [r._id, r.count])),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy Dashboard running at http://localhost:${PORT}`);
});
