import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Founders, Inc. — Clubs",
    template: "%s | Founders, Inc. Clubs",
  },
  description:
    "Member-run clubs at Founders, Inc. Fort Mason Pier 2, San Francisco. Car Club track days, Hardware Workshop, Basketball, and Tactical Paintball.",
  openGraph: {
    siteName: "Founders, Inc. Clubs",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-black selection:text-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-dvh flex-col bg-white text-black font-sans">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-xs font-mono"
        >
          Skip to content
        </a>
        <Header />
        <div id="content" className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
