import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["mongodb", "geoip-lite", "socks-proxy-agent", "http-proxy-agent", "https-proxy-agent"],
  outputFileTracingIncludes: {
    "/api/cron/scrape": ["./node_modules/geoip-lite/data/**/*"],
  },
};

export default nextConfig;
