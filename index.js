const cron = require("node-cron");
const scrape = require("./scrape");

console.log("Proxy Scraper Cron Service started");
console.log("Schedule: every hour at minute 0");
console.log("Database: mongodb://localhost:27017/verifox/free-proxy\n");

// Run immediately on startup
scrape().catch((err) => console.error("Initial scrape failed:", err));

// Then run every hour at minute 0
cron.schedule("0 * * * *", () => {
  scrape().catch((err) => console.error("Scheduled scrape failed:", err));
});
