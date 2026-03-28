const cron = require("node-cron");
const scrape = require("./scrape");
const portScan = require("./port-scan");
const validate = require("./validate");

console.log("Proxy Scraper + Port Scanner + Validator Service started");
console.log("Schedule: scrape → port scan → validate every hour\n");

async function runAll() {
  try {
    await scrape();
    console.log("Scrape done, starting port scan...\n");
    await portScan();
    console.log("Port scan done, starting validation...\n");
    await validate();
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
