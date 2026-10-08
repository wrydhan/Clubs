import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Founders, Inc. Clubs — Fort Mason, San Francisco",
    template: "%s | Founders, Inc. Clubs",
  },
  description:
    "Member-run clubs at Founders, Inc. in Fort Mason, San Francisco. Car Club, Basketball, Hardware Workshop, and Paintball. Built by founders, for founders.",
  openGraph: {
    siteName: "Founders, Inc. Clubs",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-[#1900ff] selection:text-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink font-sans">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:text-sm"
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
