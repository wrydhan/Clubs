"use client";

import { useRef, useState } from "react";
import { papers, stickerOptions, type PaperKind } from "@/lib/collage";

/**
 * The make-your-own corner: pick a paper, pick a sticker, drag it where you want
 * it, and take the scrap home as a PNG. Pointer, touch and keyboard all work.
 */
export function ScrapTable() {
  const [paper, setPaper] = useState<PaperKind>("kraft");
  const [sticker, setSticker] = useState<string>(stickerOptions[0].id);
  const [pos, setPos] = useState({ x: 50, y: 48 });
  const [angle, setAngle] = useState(-6);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const active = stickerOptions.find((option) => option.id === sticker) ?? stickerOptions[0];

  function place(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPos({
      x: Math.max(6, Math.min(94, Number(x.toFixed(1)))),
      y: Math.max(6, Math.min(94, Number(y.toFixed(1)))),
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 1 : 5;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = moves[event.key];
    if (!delta) return;
    event.preventDefault();
    setPos((current) => ({
      x: Math.max(6, Math.min(94, current.x + delta[0])),
      y: Math.max(6, Math.min(94, current.y + delta[1])),
    }));
    setNote("Sticker moved.");
  }

  async function save() {
    setBusy(true);
    setNote("Cutting your scrap…");
    try {
      const size = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");

      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("could not load " + src));
          image.src = src;
        });

      ctx.fillStyle = papers[paper].hex;
      ctx.fillRect(0, 0, size, size);

      const sheet = await load(papers[paper].src);
      ctx.globalAlpha = paper === "cream" ? 0.35 : 1;
      ctx.drawImage(sheet, 0, 0, size, size);
      ctx.globalAlpha = 1;

      const art = await load(active.src);
      const artSize = size * 0.58;
      ctx.save();
      ctx.translate((pos.x / 100) * size, (pos.y / 100) * size);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(art, -artSize / 2, -artSize / 2, artSize, artSize);
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("no blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "finc-clubs-" + active.id + ".png";
      link.click();
      URL.revokeObjectURL(url);
      setNote("Saved. Your scrap is in your downloads.");
    } catch (error) {
      setNote(
        "Could not save the PNG (" + (error as Error).message + "). The preview above is the scrap you made.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      {/* the table */}
      <div
        ref={stageRef}
        className={`relative aspect-[4/3] w-full touch-none overflow-hidden shadow-[var(--shadow-lift)] ${papers[paper].className}`}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          place(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          place(event.clientX, event.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.src}
          alt=""
          aria-hidden
          draggable={false}
          className="sticker-img pointer-events-none absolute h-[50%] w-[50%] select-none object-contain"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
        />
        <div
          tabIndex={0}
          role="group"
          aria-label="Your sticker on the scrap — use the arrow keys to move it"
          onKeyDown={onKeyDown}
          className="absolute h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink active:cursor-grabbing"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
        <span className="pointer-events-none absolute bottom-3 left-3 bg-ink/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-paper">
          {papers[paper].label} · {active.label}
        </span>
      </div>

      {/* the tool tray */}
      <div className="paper-card px-5 py-6">
        <span className="label">The table</span>
        <h3 className="mt-2 font-serif text-[1.9rem] leading-none">Cut your own scrap.</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
          Pick a paper, pick a sticker, drag it into place. Take it to your downloads.
        </p>

        <fieldset className="mt-6">
          <legend className="label">Paper</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(papers) as PaperKind[]).map((key) => (
              <label
                key={key}
                className={`cursor-pointer rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  paper === key ? "bg-ink text-paper" : "bg-ink/10 text-ink/70 hover:bg-ink/20"
                }`}
              >
                <input
                  type="radio"
                  name="scrap-paper"
                  value={key}
                  checked={paper === key}
                  onChange={() => setPaper(key)}
                  className="sr-only"
                />
                {papers[key].label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="label">Sticker</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {stickerOptions.map((option) => (
              <label
                key={option.id}
                className={`relative block aspect-square cursor-pointer overflow-hidden bg-paper transition-transform ${
                  sticker === option.id
                    ? "outline outline-2 outline-offset-2 outline-ink"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <input
                  type="radio"
                  name="scrap-sticker"
                  value={option.id}
                  checked={sticker === option.id}
                  onChange={() => setSticker(option.id)}
                  className="sr-only"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={option.src}
                  alt={option.label}
                  className="sticker-img h-full w-full object-contain"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="scrap-angle" className="label">
            Angle
          </label>
          <input
            id="scrap-angle"
            type="range"
            min={-24}
            max={24}
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value))}
            className="mt-2 w-full accent-[#241a15]"
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={save} disabled={busy} className="pill-btn w-full disabled:opacity-60">
            {busy ? "Cutting…" : "Save the scrap ↓"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPos({ x: 50, y: 48 });
              setAngle(-6);
              setNote("Scrap reset.");
            }}
            className="pill-btn-secondary w-full"
          >
            Start over
          </button>
        </div>
        <p aria-live="polite" className="mt-3 font-mono text-[10px] leading-relaxed text-ink/55">
          {note}
        </p>
      </div>
    </div>
  );
}
