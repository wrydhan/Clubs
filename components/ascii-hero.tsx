"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ASCII_ART, ASCII_WIDTH } from "@/components/ascii-art";

/* Glyph pool for the decode pass. Drawn from the same charset as the art
   (# % * + - . : = @) plus a little texture, so the scramble reads as the
   logo resolving out of noise rather than random ASCII. */
const NOISE = "#%*+-.:=@/\\|<>_abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * The Founders, Inc. ASCII lockup, full-bleed, decoding left-to-right on load.
 * The art is 298 columns wide, so it is scaled to the container width with the
 * font-size (no CSS transform — keeps the glyphs crisp). Text is server-rendered
 * as the finished logo so it shows with JS off; the effect overwrites it with the
 * reveal, then settles back to final.
 */
export function AsciiHero() {
  const preRef = useRef<HTMLPreElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [settled, setSettled] = useState(false);

  // Fit the 298-column lockup to the container width.
  useLayoutEffect(() => {
    const pre = preRef.current;
    const wrap = wrapRef.current;
    if (!pre || !wrap) return;

    const fit = () => {
      const avail = wrap.clientWidth;
      if (!avail) return;
      pre.style.fontSize = "10px";
      // offsetWidth is layout-only: the settled pulse's transform can never
      // feed a scaled width back into the fit and make the logo creep.
      const widthAt10 = pre.offsetWidth;
      if (!widthAt10) return;
      const pxPerFontPx = widthAt10 / 10;
      const fs = Math.min(avail / pxPerFontPx, 15);
      pre.style.fontSize = `${fs}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  // The decode reveal.
  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    const rows = ASCII_ART.length;
    const cols = ASCII_WIDTH;
    const final = ASCII_ART.map((r) => r.padEnd(cols, " "));
    const flat: string[] = [];
    const delay = new Float32Array(rows * cols);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        flat.push(final[y][x]);
        // A left-to-right front with per-cell jitter so it flickers in.
        delay[y * cols + x] = (x / cols) * 0.82 + Math.random() * 0.4;
      }
    }

    const render = (p: number) => {
      let out = "";
      for (let i = 0; i < flat.length; i += 1) {
        const ch = flat[i];
        if (ch === " ") {
          out += " ";
        } else if (p >= delay[i]) {
          out += ch;
        } else {
          out += NOISE[(Math.random() * NOISE.length) | 0];
        }
        if (i % cols === cols - 1) out += "\n";
      }
      pre.textContent = out;
    };

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      pre.textContent = final.join("\n");
      // Defer past the effect body so we don't set state synchronously.
      const id = requestAnimationFrame(() => setSettled(true));
      return () => cancelAnimationFrame(id);
    }

    const DURATION = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      render(eased * 1.15);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        pre.textContent = final.join("\n");
        setSettled(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-x-clip px-4 pb-12 pt-20 sm:px-8">
      <h1 className="sr-only">Founders, Inc. Clubs — events calendar</h1>

      <div ref={wrapRef} className="w-full max-w-[1560px] text-center">
        <pre
          ref={preRef}
          aria-hidden="true"
          className={`inline-block whitespace-pre text-left font-mono leading-[1.15] text-ink ${
            settled ? "logo-wave" : ""
          }`}
          style={{ letterSpacing: 0, fontSize: "6px" }}
        >
          {ASCII_ART.join("\n")}
        </pre>
      </div>

      <div
        className={`mt-10 flex flex-col items-center gap-5 transition-all duration-700 ease-out ${
          settled ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-2">
          Clubs · Fort Mason, San Francisco
        </p>
      </div>
    </section>
  );
}
