import { ogImage, ogSize } from "@/lib/og";

export const alt = "Founders, Inc. Clubs at a glance — four clubs, Fort Mason Pier 2";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    kicker: "Founders, Inc. / Clubs",
    title: "At a glance",
    subtitle: "Four clubs, their cadence, their lead and their next date.",
    footer: "Pier 2 · Fort Mason · San Francisco",
  });
}
