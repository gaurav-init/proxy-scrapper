import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Proxy Dashboard — Verifox",
  description: "Free proxies scraped from GitHub, categorized and updated every hour",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
