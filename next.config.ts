import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/clubs/overview", destination: "/clubs/roster", permanent: true },
      // The portal moved from /clubs/portal to /portal. Old URLs keep working
      // (bookmarks, previously shared links) but land on the new, gated path;
      // nothing is served under the old prefix. Permanent (308) so crawlers and
      // browsers drop the old location instead of re-checking it.
      { source: "/clubs/portal", destination: "/portal", permanent: true },
      { source: "/clubs/portal/:path*", destination: "/portal/:path*", permanent: true },
    ];
  },
  /**
   * The portal's second lock. Its layout already sets robots: noindex, and
   * robots.txt disallows the path, but both depend on a crawler choosing to
   * respect them. A response header travels with every page, subpage and API
   * route under /portal, so a page that gets linked from somewhere public
   * still cannot be indexed.
   */
  async headers() {
    return [
      {
        source: "/portal/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
