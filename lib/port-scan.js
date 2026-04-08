require("dotenv").config();
const net = require("net");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";

const SMTP_PORTS = [25, 587, 465];
const HTTP_PORTS = [80, 443, 8080];
const ALL_PORTS = [...SMTP_PORTS, ...HTTP_PORTS];

const TIMEOUT = 1500;      // 1.5s — open ports respond in <500ms
const CONCURRENCY = 1000;  // 1000 IPs at once (each checks 6 ports = 6000 sockets)

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
  console.log(`Ports: ${ALL_PORTS.join(", ")} | Timeout: ${TIMEOUT}ms | Concurrency: ${CONCURRENCY}`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const col = client.db(DB_NAME).collection(COLLECTION_NAME);

  await col.createIndex({ openPorts: 1 });
  await col.createIndex({ smtpPorts: 1 });
  await col.createIndex({ httpPorts: 1 });
  await col.createIndex({ portScannedAt: 1 });

  // Only scan active proxies that haven't been scanned in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const proxies = await col
    .find({
      status: "active",
      $or: [
        { portScannedAt: { $exists: false } },
        { portScannedAt: { $lt: oneHourAgo } },
      ],
    })
    .project({ ip: 1 })
    .toArray();

  console.log(`IPs to scan: ${proxies.length} (skipping recently scanned)\n`);

  if (proxies.length === 0) {
    console.log("Nothing to scan — all active proxies already scanned this hour.");
    await client.close();
    return;
  }

  let completed = 0;
  let totalSmtp = 0;
  let totalHttp = 0;
  const now = new Date();

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
            portScannedAt: now,
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

    if (completed % 2000 === 0 || completed === proxies.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(
        `  ${completed}/${proxies.length} (${elapsed}s) | SMTP: ${totalSmtp} | HTTP: ${totalHttp}`
      );
    }
  }

  // Stats
  const [withSmtp25, withSmtp587, withAnySmtp, withHttp80, withHttp443, withAnyHttp] =
    await Promise.all([
      col.countDocuments({ smtpPorts: 25 }),
      col.countDocuments({ smtpPorts: 587 }),
      col.countDocuments({ "smtpPorts.0": { $exists: true } }),
      col.countDocuments({ httpPorts: 80 }),
      col.countDocuments({ httpPorts: 443 }),
      col.countDocuments({ "httpPorts.0": { $exists: true } }),
    ]);

  console.log(`\n=== Results ===`);
  console.log(`SMTP: port25=${withSmtp25} | port587=${withSmtp587} | total=${withAnySmtp}`);
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
