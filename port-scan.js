require("dotenv").config();
const net = require("net");
const { SocksClient } = require("socks");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "verifox";
const COLLECTION_NAME = "free-proxy";

// Test SMTP server — connect through proxy to this target
const SMTP_TEST_HOST = "smtp.gmail.com";
const SMTP_TEST_PORTS = [25, 587];
// Test HTTP target
const HTTP_TEST_HOST = "httpbin.org";
const HTTP_TEST_PORTS = [80, 443];

const TIMEOUT = 5000;
const CONCURRENCY = 50;

// Map proxy type to SOCKS type
function getSocksType(proxyType) {
  if (proxyType === "socks5") return 5;
  if (proxyType === "socks4") return 4;
  return null;
}

// Test if a SOCKS proxy allows connecting to target:port
async function testSocksProxy(proxyIp, proxyPort, socksType, targetHost, targetPort) {
  try {
    const info = await SocksClient.createConnection({
      proxy: { host: proxyIp, port: proxyPort, type: socksType },
      command: "connect",
      destination: { host: targetHost, port: targetPort },
      timeout: TIMEOUT,
    });
    info.socket.destroy();
    return true;
  } catch {
    return false;
  }
}

// Test if an HTTP/HTTPS proxy allows CONNECT to target:port
async function testHttpProxy(proxyIp, proxyPort, targetHost, targetPort) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(TIMEOUT);

    socket.on("connect", () => {
      // Send HTTP CONNECT request
      socket.write(
        `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`
      );
    });

    socket.on("data", (data) => {
      const response = data.toString();
      socket.destroy();
      // 200 means tunnel established
      resolve(response.includes("200"));
    });

    socket.on("timeout", () => { socket.destroy(); resolve(false); });
    socket.on("error", () => { socket.destroy(); resolve(false); });

    socket.connect(proxyPort, proxyIp);
  });
}

// Test a single proxy for SMTP and HTTP connectivity
async function testProxy(proxy) {
  const socksType = getSocksType(proxy.type);
  const smtpOpen = [];
  const httpOpen = [];

  // Test SMTP ports through proxy
  for (const port of SMTP_TEST_PORTS) {
    let ok = false;
    if (socksType) {
      ok = await testSocksProxy(proxy.ip, proxy.port, socksType, SMTP_TEST_HOST, port);
    } else {
      ok = await testHttpProxy(proxy.ip, proxy.port, SMTP_TEST_HOST, port);
    }
    if (ok) smtpOpen.push(port);
  }

  // Test HTTP ports through proxy
  for (const port of HTTP_TEST_PORTS) {
    let ok = false;
    if (socksType) {
      ok = await testSocksProxy(proxy.ip, proxy.port, socksType, HTTP_TEST_HOST, port);
    } else {
      ok = await testHttpProxy(proxy.ip, proxy.port, HTTP_TEST_HOST, port);
    }
    if (ok) httpOpen.push(port);
  }

  return {
    ip: proxy.ip,
    smtpPorts: smtpOpen,
    httpPorts: httpOpen,
    openPorts: [...smtpOpen, ...httpOpen],
  };
}

async function run() {
  const startTime = Date.now();
  console.log(`\n--- Port Scan Started: ${new Date().toISOString()} ---`);
  console.log(`Testing SMTP via: ${SMTP_TEST_HOST}:${SMTP_TEST_PORTS.join(",")}`);
  console.log(`Testing HTTP via: ${HTTP_TEST_HOST}:${HTTP_TEST_PORTS.join(",")}`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const col = client.db(DB_NAME).collection(COLLECTION_NAME);

  await col.createIndex({ openPorts: 1 });
  await col.createIndex({ smtpPorts: 1 });
  await col.createIndex({ httpPorts: 1 });

  // Only scan active proxies
  const proxies = await col
    .find({ status: "active" })
    .project({ ip: 1, port: 1, type: 1 })
    .toArray();
  console.log(`Active proxies to scan: ${proxies.length}`);

  let completed = 0;
  for (let i = 0; i < proxies.length; i += CONCURRENCY) {
    const batch = proxies.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(testProxy));

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

    completed += batch.length;
    const smtpHits = results.filter((r) => r.smtpPorts.length > 0).length;
    const httpHits = results.filter((r) => r.httpPorts.length > 0).length;
    if (completed % 500 === 0 || completed === proxies.length) {
      console.log(
        `  Scanned ${completed}/${proxies.length} (batch: ${smtpHits} smtp, ${httpHits} http)`
      );
    }
  }

  // Set empty arrays for unscanned proxies
  await col.updateMany(
    { openPorts: { $exists: false } },
    { $set: { openPorts: [], smtpPorts: [], httpPorts: [] } }
  );

  // Stats
  const withSmtp25 = await col.countDocuments({ smtpPorts: 25 });
  const withSmtp587 = await col.countDocuments({ smtpPorts: 587 });
  const withAnySmtp = await col.countDocuments({ "smtpPorts.0": { $exists: true } });
  const withHttp80 = await col.countDocuments({ httpPorts: 80 });
  const withHttp443 = await col.countDocuments({ httpPorts: 443 });
  const withAnyHttp = await col.countDocuments({ "httpPorts.0": { $exists: true } });

  console.log(`\n=== Results ===`);
  console.log(`SMTP: port25=${withSmtp25} | port587=${withSmtp587} | any=${withAnySmtp}`);
  console.log(`HTTP: port80=${withHttp80} | port443=${withHttp443} | any=${withAnyHttp}`);

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
