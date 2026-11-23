import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const revalidate = 3600;

/**
 * Site-wide metadata. The canonical URL is set per page, never here: a root
 * canonical would hand every portal page a link to the public home page.
 *
 * The 1200x630 card is the file convention (app/opengraph-image.tsx), which
 * Next turns into og:image and the twitter:image fallback automatically.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Founders, Inc. Clubs — events calendar, San Francisco",
    template: "%s | Founders, Inc. Clubs",
  },
  description: siteDescription,
  openGraph: {
    siteName,
    type: "website",
    locale: "en_US",
    title: "Founders, Inc. Clubs — events calendar, San Francisco",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Founders, Inc. Clubs — events calendar, San Francisco",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:text-paper"
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
