require("dotenv").config();
const axios = require("axios");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";

const TEST_URLS = [
  "http://httpbin.org/ip",
  "http://ip-api.com/json",
  "http://ifconfig.me/ip",
];
const TIMEOUT = 10000;
const CONCURRENCY = 50;

let SocksProxyAgent, HttpsProxyAgent, HttpProxyAgent;

async function loadAgents() {
  ({ SocksProxyAgent } = await import("socks-proxy-agent"));
  ({ HttpsProxyAgent } = await import("https-proxy-agent"));
  ({ HttpProxyAgent } = await import("http-proxy-agent"));
}

function buildAgent(type, ip, port) {
  if (type === "socks4" || type === "socks5") {
    const agent = new SocksProxyAgent(`${type}://${ip}:${port}`);
    return { http: agent, https: agent };
  }
  return {
    http: new HttpProxyAgent(`http://${ip}:${port}`),
    https: new HttpsProxyAgent(`http://${ip}:${port}`),
  };
}

async function testProxy(proxy) {
  const agents = buildAgent(proxy.type, proxy.ip, proxy.port);
  for (const url of TEST_URLS) {
    try {
      const res = await axios.get(url, {
        httpAgent: agents.http,
        httpsAgent: agents.https,
        timeout: TIMEOUT,
        validateStatus: () => true,
      });
      if (res.status === 407) return "auth_required";
      if (res.status >= 200 && res.status < 300) return "working";
    } catch {
      continue;
    }
  }
  return "failed";
}

async function validate() {
  const startTime = Date.now();
  console.log(`\n--- Proxy Validation Started: ${new Date().toISOString()} ---`);

  await loadAgents();

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const proxies = await collection
      .find({ status: "active" })
      .project({ ip: 1, port: 1, type: 1 })
      .toArray();

    console.log(`Testing ${proxies.length} active proxies (concurrency: ${CONCURRENCY})...`);

    let working = 0;
    let authRequired = 0;
    let failed = 0;
    const now = new Date();

    for (let i = 0; i < proxies.length; i += CONCURRENCY) {
      const batch = proxies.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map(async (proxy) => {
          const result = await testProxy(proxy);
          return { ip: proxy.ip, result };
        })
      );

      const bulkOps = [];
      for (const { ip, result } of results) {
        if (result === "auth_required") {
          authRequired++;
          bulkOps.push({
            updateOne: {
              filter: { ip },
              update: { $set: { validated: false, validatedAt: now, authRequired: true } },
            },
          });
        } else if (result === "working") {
          working++;
          bulkOps.push({
            updateOne: {
              filter: { ip },
              update: { $set: { validated: true, validatedAt: now, authRequired: false } },
            },
          });
        } else {
          failed++;
          bulkOps.push({
            updateOne: {
              filter: { ip },
              update: { $set: { validated: false, validatedAt: now, authRequired: false } },
            },
          });
        }
      }

      if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps, { ordered: false });
      }

      const done = Math.min(i + CONCURRENCY, proxies.length);
      if (done % 200 === 0 || done === proxies.length) {
        console.log(`  Progress: ${done}/${proxies.length} | working: ${working}, failed: ${failed}, auth: ${authRequired}`);
      }
    }

    console.log(`\nValidation complete: ${working} working, ${failed} failed, ${authRequired} auth-required`);

    const totalValidated = await collection.countDocuments({ validated: true });
    console.log(`DB verified proxies: ${totalValidated}`);
  } finally {
    await client.close();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`--- Validation done in ${elapsed}s ---\n`);
}

module.exports = validate;

if (require.main === module) {
  validate().catch((err) => {
    console.error("Validation failed:", err);
    process.exit(1);
  });
}
