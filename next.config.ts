import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    // /clubs/overview ("At a glance") is retired: the roster is the one page
    // that shows every club. Permanent so bookmarks and link equity follow.
    return [
      { source: "/clubs/overview", destination: "/clubs/roster", permanent: true },
      { source: "/clubs/overview/:path*", destination: "/clubs/roster", permanent: true },
    ];
  },
};

export default nextConfig;
