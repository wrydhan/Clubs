import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

let fontData: Promise<ArrayBuffer> | null = null;

function loadFont(): Promise<ArrayBuffer> {
  fontData ??= readFile(path.join(process.cwd(), "assets/fonts/Newsreader-Medium.ttf")).then((buf) => {
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  });
  return fontData;
}

export async function ogImage({
  kicker,
  title,
  subtitle,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  footer: string;
}) {
  const font = await loadFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f1ea",
          color: "#14120e",
          fontFamily: "Newsreader",
        }}
      >
        <div style={{ width: 18, height: "100%", background: "#1900ff" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 3 }}>
            <span>{kicker.toUpperCase()}</span>
            <span>SAN FRANCISCO</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 84, lineHeight: 1, letterSpacing: -1 }}>{title}</div>
            <div style={{ marginTop: 18, fontSize: 36, lineHeight: 1.15, maxWidth: 860 }}>{subtitle}</div>
          </div>
          <div style={{ fontSize: 28 }}>{footer}</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [{ name: "Newsreader", data: font, style: "normal", weight: 500 }],
    },
  );
}
