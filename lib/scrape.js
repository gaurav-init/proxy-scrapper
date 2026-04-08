require("dotenv").config();
const axios = require("axios");
const geoip = require("geoip-lite");
const { MongoClient } = require("mongodb");
const PROXY_SOURCES = require("./sources");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";
const ONE_HOUR_MS = 60 * 60 * 1000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

const PLAIN_REGEX = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/;
const AUTH_AT_REGEX = /^(.+):(.+)@(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/;
const AUTH_COLON_REGEX = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5}):(.+):(.+)$/;

function parseProxies(text) {
  const proxies = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let m = trimmed.match(AUTH_AT_REGEX);
    if (m) {
      proxies.push({ ip: m[3], port: parseInt(m[4], 10), user: m[1], pass: m[2] });
      continue;
    }

    m = trimmed.match(AUTH_COLON_REGEX);
    if (m) {
      proxies.push({ ip: m[1], port: parseInt(m[2], 10), user: m[3], pass: m[4] });
      continue;
    }

    if (PLAIN_REGEX.test(trimmed)) {
      const idx = trimmed.indexOf(":");
      proxies.push({ ip: trimmed.slice(0, idx), port: parseInt(trimmed.slice(idx + 1), 10), user: "", pass: "" });
    }
  }
  return proxies;
}

const commitCache = new Map();

async function getLastCommitTime(source) {
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
      user: p.user || "",
      pass: p.pass || "",
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

  const allProxies = [];
  for (let i = 0; i < PROXY_SOURCES.length; i += 10) {
    const batch = PROXY_SOURCES.slice(i, i + 10);
    const results = await Promise.all(batch.map(fetchSource));
    for (const result of results) {
      for (const proxy of result) {
        allProxies.push(proxy);
      }
    }
  }

  const ipMap = new Map();
  for (const proxy of allProxies) {
    const existing = ipMap.get(proxy.ip);
    if (!existing || (proxy.status === "active" && existing.status === "inactive")) {
      ipMap.set(proxy.ip, proxy);
    }
  }
  const unique = Array.from(ipMap.values());

  const counts = {};
  const statusCounts = { active: 0, inactive: 0 };
  for (const p of unique) {
    counts[p.type] = (counts[p.type] || 0) + 1;
    statusCounts[p.status]++;
  }

  console.log(`\nTotal unique IPs: ${unique.length} (from ${allProxies.length} raw)`);
  console.log("By category:", counts);
  console.log("By status:", statusCounts);

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.createIndex({ ip: 1 }, { unique: true });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ scrapedAt: 1 });
    await collection.createIndex({ country: 1 });
    await collection.createIndex({ validated: 1 });

    const now = new Date();

    let inserted = 0;
    let updated = 0;
    for (let i = 0; i < unique.length; i += 500) {
      const batch = unique.slice(i, i + 500);
      const bulkOps = batch.map((proxy) => {
        const geo = geoip.lookup(proxy.ip);
        return {
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
                country: geo ? geo.country : "??",
                city: geo ? geo.city : "",
                user: proxy.user || "",
                pass: proxy.pass || "",
                hasAuth: !!(proxy.user && proxy.pass),
              },
              $setOnInsert: {
                firstSeen: now,
                openPorts: [],
                smtpPorts: [],
                httpPorts: [],
                validated: false,
                validatedAt: null,
              },
            },
            upsert: true,
          },
        };
      });
      const result = await collection.bulkWrite(bulkOps, { ordered: false });
      inserted += result.upsertedCount || 0;
      updated += result.modifiedCount || 0;
    }

    await collection.updateMany(
      { scrapedAt: { $lt: now } },
      { $set: { status: "inactive", openPorts: [], smtpPorts: [], httpPorts: [] }, $unset: { portScannedAt: "" } }
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
  const validate = require("./validate");
  scrape()
    .then(() => {
      console.log("Scrape done, starting validation...\n");
      return validate();
    })
    .catch((err) => {
      console.error("Failed:", err);
      process.exit(1);
    });
}
