import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [{ source: "/clubs/overview", destination: "/clubs/roster", permanent: true }];
  },
};

export default nextConfig;
