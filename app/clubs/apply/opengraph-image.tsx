import { ogImage, ogSize } from "@/lib/og";

export const alt = "Start a club at Founders, Inc. in San Francisco";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    kicker: "Founders, Inc.",
    title: "Start a club",
    subtitle: "Funding, space at Fort Mason, and the name. You run it.",
    footer: "San Francisco",
  });
}
