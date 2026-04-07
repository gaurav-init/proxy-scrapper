import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["mongodb", "geoip-lite", "socks-proxy-agent", "http-proxy-agent", "https-proxy-agent"],
  outputFileTracingIncludes: {
    "/api/cron/scrape": ["./scrape.js", "./sources.js"],
    "/api/cron/port-scan": ["./port-scan.js"],
    "/api/cron/validate": ["./validate.js"],
  },
};

export default nextConfig;
