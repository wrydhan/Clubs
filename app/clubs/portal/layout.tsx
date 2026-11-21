import type { Metadata } from "next";

/** Everything under /clubs/portal is private: no indexing, no shared caching. */
export const metadata: Metadata = {
  title: { default: "Clubs portal", template: "%s | Clubs portal" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-paperdeep/40">{children}</div>;
}
