import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["mongodb", "geoip-lite", "socks-proxy-agent", "http-proxy-agent", "https-proxy-agent"],
};

export default nextConfig;
