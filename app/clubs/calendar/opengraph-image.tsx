import { ogImage, ogSize } from "@/lib/og";

export const alt = "Founders, Inc. club calendar in San Francisco";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    kicker: "Founders, Inc.",
    title: "Calendar",
    subtitle: "What's scheduled.",
    footer: "Fort Mason, San Francisco",
  });
}
