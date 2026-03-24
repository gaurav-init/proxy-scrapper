const cron = require("node-cron");
const scrape = require("./scrape");
const portScan = require("./port-scan");

console.log("Proxy Scraper + Port Scanner Service started");
console.log("Schedule: scrape every hour → port scan after each scrape\n");

async function runAll() {
  try {
    await scrape();
    console.log("Scrape done, starting port scan...\n");
    await portScan();
  } catch (err) {
    console.error("Run failed:", err);
  }
}

// Run immediately on startup
runAll();

// Then run every hour at minute 0
cron.schedule("0 * * * *", () => {
  runAll();
});
