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
  /**
   * The portal's second lock. Its layout already sets robots: noindex, and
   * robots.txt disallows the path, but both depend on a crawler choosing to
   * respect them. A response header travels with every page, subpage and API
   * route under /clubs/portal, so a page that gets linked from somewhere public
   * still cannot be indexed.
   */
  async headers() {
    return [
      {
        source: "/clubs/portal/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
