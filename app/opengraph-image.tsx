import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteUrl } from "@/lib/site";

/**
 * The 1200x630 share card, generated at build time.
 *
 * A generated card beats a static upload here because the site is one page whose
 * only changing fact is the next event: the text comes from the same event data
 * the page renders, so the card can never advertise an event the calendar has
 * already dropped. Brand: black ink on printer paper, hairlines, one serif line.
 */

export const alt =
  "Founders, Inc. Clubs — tournaments, track days, workshops and field days at Fort Mason Pier 2, San Francisco";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const PAPER = "#FFFFFF";
const INK = "#000000";
const INK_3 = "#333333";
const RULE = "rgba(0,0,0,0.14)";

async function readAsset(relativePath: string): Promise<ArrayBuffer> {
  const file = await readFile(path.join(process.cwd(), relativePath));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

export default async function OpengraphImage() {
  const [serif, condensed, mark] = await Promise.all([
    readAsset("assets/fonts/Newsreader-Medium.ttf"),
    readAsset("assets/fonts/BarlowCondensed-Medium.ttf"),
    readFile(path.join(process.cwd(), "app/icon.png")),
  ]);

  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={markSrc} width={56} height={56} alt="" />
            <div
              style={{
                display: "flex",
                fontFamily: "Barlow",
                fontSize: 26,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: INK,
              }}
            >
              Founders, Inc. / Clubs
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Barlow",
              fontSize: 24,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: INK_3,
            }}
          >
            {siteUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 2, background: RULE, marginBottom: 40 }} />
          <div
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontSize: 150,
              lineHeight: 0.92,
              letterSpacing: -5,
              color: INK,
            }}
          >
            Clubs.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 880,
              fontSize: 32,
              lineHeight: 1.35,
              color: INK_3,
            }}
          >
            Tournaments, track days, workshops and field days for the Founders, Inc. campus at Fort
            Mason Pier 2, San Francisco.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, background: RULE, marginBottom: 22 }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Barlow",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: INK_3,
            }}
          >
            <div style={{ display: "flex" }}>Events calendar</div>
            <div style={{ display: "flex" }}>Fort Mason · San Francisco</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, style: "normal", weight: 500 },
        { name: "Barlow", data: condensed, style: "normal", weight: 500 },
      ],
    },
  );
}
