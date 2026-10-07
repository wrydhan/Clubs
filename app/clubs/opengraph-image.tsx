import { ogImage, ogSize } from "@/lib/og";

export const alt = "Founders, Inc. Clubs in San Francisco";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    kicker: "Founders, Inc.",
    title: "Clubs",
    subtitle: "We fund the club. You show up.",
    footer: "Fort Mason, San Francisco",
  });
}
