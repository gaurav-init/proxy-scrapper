import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Scraper files are not part of the Next.js app
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
