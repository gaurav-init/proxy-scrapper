require("dotenv").config();
const net = require("net");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";

// Check ports directly on the proxy IP
const SMTP_PORTS = [25, 587, 465];
const HTTP_PORTS = [80, 443, 8080];
const ALL_PORTS = [...SMTP_PORTS, ...HTTP_PORTS];

const TIMEOUT = 3000;
const CONCURRENCY = 300;

function checkPort(ip, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(TIMEOUT);
    socket.on("connect", () => { socket.destroy(); resolve(port); });
    socket.on("timeout", () => { socket.destroy(); resolve(null); });
    socket.on("error", () => { socket.destroy(); resolve(null); });
    socket.connect(port, ip);
  });
}

async function scanPorts(ip) {
  const results = await Promise.all(ALL_PORTS.map((p) => checkPort(ip, p)));
  const open = results.filter((p) => p !== null);
  return {
    openPorts: open,
    smtpPorts: open.filter((p) => SMTP_PORTS.includes(p)),
    httpPorts: open.filter((p) => HTTP_PORTS.includes(p)),
  };
}

async function run() {
  const startTime = Date.now();
  console.log(`\n--- Port Scan Started: ${new Date().toISOString()} ---`);
  console.log(`SMTP ports: ${SMTP_PORTS.join(", ")}`);
  console.log(`HTTP ports: ${HTTP_PORTS.join(", ")}`);
  console.log(`Scanning directly on proxy IP (not through proxy)`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const col = client.db(DB_NAME).collection(COLLECTION_NAME);

  await col.createIndex({ openPorts: 1 });
  await col.createIndex({ smtpPorts: 1 });
  await col.createIndex({ httpPorts: 1 });

  // Only scan active proxies
  const proxies = await col.find({ status: "active" }).project({ ip: 1 }).toArray();
  console.log(`Active proxies to scan: ${proxies.length}\n`);

  let completed = 0;
  let totalSmtp = 0;
  let totalHttp = 0;

  for (let i = 0; i < proxies.length; i += CONCURRENCY) {
    const batch = proxies.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (proxy) => {
        const scan = await scanPorts(proxy.ip);
        return { ip: proxy.ip, ...scan };
      })
    );

    const bulkOps = results.map((r) => ({
      updateOne: {
        filter: { ip: r.ip },
        update: {
          $set: {
            openPorts: r.openPorts,
            smtpPorts: r.smtpPorts,
            httpPorts: r.httpPorts,
          },
        },
      },
    }));
    await col.bulkWrite(bulkOps, { ordered: false });

    const batchSmtp = results.filter((r) => r.smtpPorts.length > 0).length;
    const batchHttp = results.filter((r) => r.httpPorts.length > 0).length;
    totalSmtp += batchSmtp;
    totalHttp += batchHttp;
    completed += batch.length;

    if (completed % 600 === 0 || completed === proxies.length) {
      console.log(
        `  ${completed}/${proxies.length} scanned | SMTP found: ${totalSmtp} | HTTP found: ${totalHttp}`
      );
    }
  }

  // Stats
  const withSmtp25 = await col.countDocuments({ smtpPorts: 25 });
  const withSmtp587 = await col.countDocuments({ smtpPorts: 587 });
  const withSmtp465 = await col.countDocuments({ smtpPorts: 465 });
  const withAnySmtp = await col.countDocuments({ "smtpPorts.0": { $exists: true } });
  const withHttp80 = await col.countDocuments({ httpPorts: 80 });
  const withHttp443 = await col.countDocuments({ httpPorts: 443 });
  const withAnyHttp = await col.countDocuments({ "httpPorts.0": { $exists: true } });

  console.log(`\n=== Results ===`);
  console.log(`SMTP: port25=${withSmtp25} | port587=${withSmtp587} | port465=${withSmtp465} | total=${withAnySmtp}`);
  console.log(`HTTP: port80=${withHttp80} | port443=${withHttp443} | total=${withAnyHttp}`);

  await client.close();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`--- Port scan done in ${elapsed}s ---\n`);
}

module.exports = run;

if (require.main === module) {
  run().catch((err) => {
    console.error("Port scan failed:", err);
    process.exit(1);
  });
}
