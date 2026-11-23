import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/site";

/**
 * Web app manifest. Next emits the <link rel="manifest"> itself, so this is the
 * only place the install name, theme colour and icon set are declared — the same
 * f.inc mark the browser tab uses, at the sizes a launcher asks for.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Clubs",
    description: siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    lang: "en-US",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
