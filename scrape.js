require("dotenv").config();
const axios = require("axios");
const { MongoClient } = require("mongodb");
const PROXY_SOURCES = require("./sources");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";
const ONE_HOUR_MS = 60 * 60 * 1000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

const PROXY_REGEX = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/;

function parseProxies(text) {
  const proxies = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (PROXY_REGEX.test(trimmed)) {
      const idx = trimmed.indexOf(":");
      proxies.push({
        ip: trimmed.slice(0, idx),
        port: parseInt(trimmed.slice(idx + 1), 10),
      });
    }
  }
  return proxies;
}

// Cache commit times per repo (not per file) to minimize API calls
const commitCache = new Map();

async function getLastCommitTime(source) {
  // Cache by repo (all files in same repo share the same commit freshness)
  const cacheKey = source.repo;
  if (commitCache.has(cacheKey)) return commitCache.get(cacheKey);

  try {
    const apiUrl = `https://api.github.com/repos/${source.repo}/commits?per_page=1`;
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    const { data } = await axios.get(apiUrl, { timeout: 10000, headers });
    if (data && data.length > 0) {
      const commitDate = new Date(data[0].commit.committer.date);
      commitCache.set(cacheKey, commitDate);
      return commitDate;
    }
  } catch (err) {
    // On rate limit, don't retry
    if (err.response && err.response.status === 403) {
      console.error(`  [GitHub API] Rate limited — skipping commit checks`);
      commitCache.set(cacheKey, null);
    }
  }
  commitCache.set(cacheKey, null);
  return null;
}

async function fetchSource(source) {
  try {
    const { data } = await axios.get(source.url, { timeout: 20000 });
    const proxies = parseProxies(data);

    const lastCommit = await getLastCommitTime(source);
    const now = new Date();
    const isRecent =
      lastCommit && now.getTime() - lastCommit.getTime() <= ONE_HOUR_MS;
    const status = isRecent ? "active" : "inactive";

    const commitAgo = lastCommit
      ? `${((now.getTime() - lastCommit.getTime()) / 3600000).toFixed(1)}h ago`
      : "unknown";

    console.log(
      `  [${source.name}] ${source.type}: ${proxies.length} proxies | commit: ${commitAgo} → ${status}`
    );

    return proxies.map((p) => ({
      ip: p.ip,
      port: p.port,
      type: source.type,
      source: source.name,
      lastCommit,
      status,
    }));
  } catch (err) {
    console.error(
      `  [${source.name}] ${source.type}: FAILED - ${err.message}`
    );
    return [];
  }
}

async function scrape() {
  const startTime = Date.now();
  console.log(`\n--- Proxy Scrape Started: ${new Date().toISOString()} ---`);

  commitCache.clear();

  // Fetch sources in batches of 5 to avoid overwhelming
  const allProxies = [];
  for (let i = 0; i < PROXY_SOURCES.length; i += 5) {
    const batch = PROXY_SOURCES.slice(i, i + 5);
    const results = await Promise.all(batch.map(fetchSource));
    for (const result of results) {
      for (const proxy of result) {
        allProxies.push(proxy);
      }
    }
  }

  // Deduplicate by unique IP — prefer active over inactive
  const ipMap = new Map();
  for (const proxy of allProxies) {
    const existing = ipMap.get(proxy.ip);
    if (!existing || (proxy.status === "active" && existing.status === "inactive")) {
      ipMap.set(proxy.ip, proxy);
    }
  }
  const unique = Array.from(ipMap.values());

  // Counts
  const counts = {};
  const statusCounts = { active: 0, inactive: 0 };
  for (const p of unique) {
    counts[p.type] = (counts[p.type] || 0) + 1;
    statusCounts[p.status]++;
  }

  console.log(`\nTotal unique IPs: ${unique.length} (from ${allProxies.length} raw)`);
  console.log("By category:", counts);
  console.log("By status:", statusCounts);

  // Store in MongoDB
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.createIndex({ ip: 1 }, { unique: true });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ scrapedAt: 1 });

    const now = new Date();

    // Upsert in batches of 500
    let inserted = 0;
    let updated = 0;
    for (let i = 0; i < unique.length; i += 500) {
      const batch = unique.slice(i, i + 500);
      const bulkOps = batch.map((proxy) => ({
        updateOne: {
          filter: { ip: proxy.ip },
          update: {
            $set: {
              ip: proxy.ip,
              port: proxy.port,
              type: proxy.type,
              source: proxy.source,
              scrapedAt: now,
              lastCommit: proxy.lastCommit,
              status: proxy.status,
            },
            $setOnInsert: { firstSeen: now, openPorts: [], smtpPorts: [], httpPorts: [] },
          },
          upsert: true,
        },
      }));
      const result = await collection.bulkWrite(bulkOps, { ordered: false });
      inserted += result.upsertedCount || 0;
      updated += result.modifiedCount || 0;
    }

    // Old proxies not in this scrape → inactive
    await collection.updateMany(
      { scrapedAt: { $lt: now } },
      { $set: { status: "inactive" } }
    );

    console.log(`\nDB: ${inserted} new, ${updated} updated`);

    const totalInDb = await collection.countDocuments();
    const activeInDb = await collection.countDocuments({ status: "active" });
    const inactiveInDb = await collection.countDocuments({ status: "inactive" });
    console.log(`DB total: ${totalInDb} | active: ${activeInDb} | inactive: ${inactiveInDb}`);
  } finally {
    await client.close();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`--- Done in ${elapsed}s ---\n`);
}

module.exports = scrape;

if (require.main === module) {
  scrape().catch((err) => {
    console.error("Scrape failed:", err);
    process.exit(1);
  });
}
