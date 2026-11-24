import type { Metadata } from "next";

/** Everything under /portal is private: no indexing, no shared caching. */
export const metadata: Metadata = {
  title: { default: "Clubs portal", template: "%s | Clubs portal" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * The dark scope. Every token the shared components read is re-pointed inside
 * `.portal-dark` (app/globals.css), so the public site keeps its paper look and
 * the portal renders as a plain dark dashboard.
 */
export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="portal-dark flex flex-1 flex-col">{children}</div>;
}
