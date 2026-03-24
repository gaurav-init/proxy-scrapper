# Proxy Scraper — Verifox

Cron job service that scrapes free proxies from **40+ GitHub repositories**, deduplicates by unique IP, categorizes by protocol, and stores them in MongoDB. Includes a web dashboard to browse active proxies.

## How It Works

1. Fetches proxy lists from 40+ GitHub repos (raw text files)
2. Checks each source repo's **last commit time** via the GitHub API
3. If the repo was updated within the **last 1 hour** → proxies are `active`
4. If the repo hasn't been updated in 1+ hours → proxies are `inactive`
5. Proxies not found in the current scrape are also marked `inactive`
6. **Deduplicates by unique IP** — only one entry per IP address (prefers active)
7. Stores everything in MongoDB with upsert

## Requirements

- Node.js >= 18
- MongoDB running at `localhost:27017`

## Setup

```bash
cd proxy-scraper
npm install
```

## Usage

### Run one-off scrape

```bash
npm run scrape
```

### Start cron service (scrapes every hour)

```bash
npm start
```

### Start web dashboard

```bash
npm run dashboard
```

Opens at **http://localhost:3069**

### Run both cron + dashboard

```bash
npm run dev
```

## Web Dashboard

- Browse all proxies with pagination
- Filter by type: HTTP, HTTPS, SOCKS4, SOCKS5
- Filter by status: Active / Inactive / All
- Copy any proxy with one click
- Live stats cards showing counts
- Auto-refreshes every 5 minutes

## API Endpoints

### `GET /api/proxies`

Query params: `status`, `type`, `page`, `limit`

```bash
curl "http://localhost:3069/api/proxies?status=active&type=http&page=1&limit=50"
```

### `GET /api/stats`

```bash
curl "http://localhost:3069/api/stats"
```

## MongoDB

- **URI:** `mongodb://localhost:27017`
- **Database:** `verifox`
- **Collection:** `free-proxy`

### Document Schema

```json
{
  "ip": "1.2.3.4",
  "port": 8080,
  "type": "http",
  "source": "TheSpeedX",
  "status": "active",
  "scrapedAt": "2026-03-24T08:00:00.000Z",
  "lastCommit": "2026-03-24T07:30:00.000Z",
  "firstSeen": "2026-03-20T12:00:00.000Z"
}
```

### Useful Queries

```js
// All active HTTP proxies
db.getCollection("free-proxy").find({ status: "active", type: "http" })

// Active counts by type
db.getCollection("free-proxy").aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
```

## Proxy Sources (40+)

| Source | Types | Frequency |
|---|---|---|
| TheSpeedX/PROXY-List | HTTP | Daily |
| TheSpeedX/SOCKS-List | SOCKS4, SOCKS5 | Daily |
| monosans/proxy-list | HTTP, SOCKS4, SOCKS5 | Hourly |
| clarketm/proxy-list | HTTP | Daily |
| ShiftyTR/Proxy-List | HTTP | Hourly |
| hookzof/socks5_list | SOCKS5 | Auto |
| ErcinDedeoglu/proxies | HTTP, HTTPS, SOCKS4, SOCKS5 | Daily |
| proxifly/free-proxy-list | HTTP, SOCKS4, SOCKS5 | 5 min |
| jetkai/proxy-list | HTTP, HTTPS, SOCKS4, SOCKS5 | Hourly |
| vakhov/fresh-proxy-list | HTTP, HTTPS, SOCKS4, SOCKS5 | 5-20 min |
| prxchk/proxy-list | HTTP, SOCKS4, SOCKS5 | 10 min |
| ALIILAPRO/Proxy | HTTP, SOCKS4, SOCKS5 | Hourly |
| mmpx12/proxy-list | HTTP, HTTPS, SOCKS4, SOCKS5 | Hourly |
| roosterkid/openproxylist | HTTPS, SOCKS4, SOCKS5 | Hourly |
| rdavydov/proxy-list | HTTP, SOCKS4, SOCKS5 | 30 min |
| Anonym0usWork1221/Free-Proxies | HTTP, HTTPS, SOCKS4, SOCKS5 | 2h |
| zloi-user/hideip.me | HTTP, HTTPS, SOCKS4, SOCKS5 | 10 min |
| Zaeem20/FREE_PROXIES_LIST | HTTP, HTTPS, SOCKS4 | 10 min |
| Vann-Dev/proxy-list | HTTP, SOCKS4 | Daily |
| Thordata/awesome-free-proxy-list | HTTP, HTTPS, SOCKS4, SOCKS5 | Daily |
| r00tee/Proxy-List | HTTPS, SOCKS4, SOCKS5 | 5 min |
| ProxyScraper/ProxyScraper | HTTP, SOCKS4, SOCKS5 | Hourly |
| sunny9577/proxy-scraper | HTTP | 3h |
| TuanMinPay/live-proxy | HTTP, SOCKS4, SOCKS5 | Daily |
| proxylist-to/proxy-list | HTTP, SOCKS4, SOCKS5 | Daily |
| im-razvan/proxy_list | HTTP, SOCKS5 | Daily |
| dpangestuw/Free-Proxy | HTTP, SOCKS4, SOCKS5 | Daily |
| Argh94/Proxy-List | HTTP, HTTPS, SOCKS4, SOCKS5 | Daily |
| mzyui/proxy-list | HTTP, SOCKS4, SOCKS5 | Daily |
| iplocate/free-proxy-list | HTTP, HTTPS, SOCKS4, SOCKS5 | 30 min |
| databay-labs/free-proxy-list | HTTP, SOCKS5 | Daily |
| dinoz0rg/proxy-list | HTTP, SOCKS4, SOCKS5 | Daily |
| elliottophellia/proxylist | HTTP, SOCKS4, SOCKS5 | Daily |
| Jakee8718/Free-Proxies | HTTP, HTTPS, SOCKS4, SOCKS5 | Daily |
| Skillter/ProxyGather | HTTP, SOCKS4, SOCKS5 | 30 min |
| ClearProxy/checked-proxy-list | SOCKS5 | Daily |
| MuRongPIG/Proxy-Master | HTTP, SOCKS4, SOCKS5 | Daily |
