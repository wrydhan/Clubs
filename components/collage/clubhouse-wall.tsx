"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tape } from "@/components/collage/paper";
import type { ClubEvent } from "@/lib/clubs";
import { formatMonthDay } from "@/lib/format";

type ScrapId = "wordmark" | "note" | "helmet" | "sneaker" | "badge-cars" | "badge-hoops";

const START: Record<ScrapId, { x: number; y: number }> = {
  wordmark: { x: 0, y: 0 },
  note: { x: 0, y: 0 },
  helmet: { x: 0, y: 0 },
  sneaker: { x: 0, y: 0 },
  "badge-cars": { x: 0, y: 0 },
  "badge-hoops": { x: 0, y: 0 },
};

const LABELS: Record<ScrapId, string> = {
  wordmark: "Founders, Inc. Clubs wordmark",
  note: "Handwritten track day note",
  helmet: "Racing helmet magazine cut-out",
  sneaker: "Running shoe magazine cut-out",
  "badge-cars": "Car Club sticker",
  "badge-hoops": "Basketball Club sticker",
};

const LIMIT = 90;

export function ClubhouseWall({ nextEvent }: { nextEvent?: ClubEvent }) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [offsets, setOffsets] = useState<Record<ScrapId, { x: number; y: number }>>(START);
  const [dragging, setDragging] = useState<ScrapId | null>(null);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const dragOrigin = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // pointer parallax driven through CSS vars so it never re-renders React
  useEffect(() => {
    const board = boardRef.current;
    if (!board || reduced) return;
    let frame = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      frame = 0;
      board.style.setProperty("--px", tx.toFixed(4));
      board.style.setProperty("--py", ty.toFixed(4));
    };
    const onMove = (event: PointerEvent) => {
      const rect = board.getBoundingClientRect();
      tx = (event.clientX - rect.left) / rect.width - 0.5;
      ty = (event.clientY - rect.top) / rect.height - 0.5;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    board.addEventListener("pointermove", onMove);
    board.addEventListener("pointerleave", onLeave);
    return () => {
      board.removeEventListener("pointermove", onMove);
      board.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const move = useCallback((id: ScrapId, dx: number, dy: number) => {
    setOffsets((current) => {
      const next = {
        x: Math.max(-LIMIT, Math.min(LIMIT, current[id].x + dx)),
        y: Math.max(-LIMIT, Math.min(LIMIT, current[id].y + dy)),
      };
      return { ...current, [id]: next };
    });
  }, []);

  function onPointerDown(id: ScrapId) {
    return (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragOrigin.current = { x: event.clientX, y: event.clientY, ox: offsets[id].x, oy: offsets[id].y };
      setDragging(id);
    };
  }

  function onPointerMove(id: ScrapId) {
    return (event: React.PointerEvent<HTMLElement>) => {
      const origin = dragOrigin.current;
      if (!origin || dragging !== id) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      setOffsets((current) => ({
        ...current,
        [id]: {
          x: Math.max(-LIMIT, Math.min(LIMIT, origin.ox + dx)),
          y: Math.max(-LIMIT, Math.min(LIMIT, origin.oy + dy)),
        },
      }));
    };
  }

  function endDrag(id: ScrapId) {
    return () => {
      if (dragging === id) {
        dragOrigin.current = null;
        setDragging(null);
        setAnnounce(`${LABELS[id]} moved.`);
      }
    };
  }

  function onKeyDown(id: ScrapId) {
    return (event: React.KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 4 : 16;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        setOffsets((current) => ({ ...current, [id]: { x: 0, y: 0 } }));
        setAnnounce(`${LABELS[id]} put back.`);
        return;
      }
      const delta = map[event.key];
      if (!delta) return;
      event.preventDefault();
      move(id, delta[0], delta[1]);
      setAnnounce(`${LABELS[id]} moved.`);
    };
  }

  const dragProps = (id: ScrapId) => ({
    onPointerDown: onPointerDown(id),
    onPointerMove: onPointerMove(id),
    onPointerUp: endDrag(id),
    onPointerCancel: endDrag(id),
    onKeyDown: onKeyDown(id),
    tabIndex: 0,
    role: "group" as const,
    "aria-label": `${LABELS[id]} — drag to move, or use arrow keys; press R to put it back`,
  });

  const layer = (id: ScrapId, depth: number) => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth * 26}px), calc(var(--py, 0) * ${
      depth * 18
    }px), 0)`,
  });

  return (
    <section
      aria-labelledby="wall-heading"
      className="relative w-full overflow-hidden border-b border-line/60"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/collage/paper-cork.webp"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#3a2a1e]/25 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_10%,rgba(255,247,232,0.35),transparent_55%),radial-gradient(100%_80%_at_80%_90%,rgba(36,26,21,0.35),transparent_60%)]" />
      </div>

      <div
        ref={boardRef}
        className="relative mx-auto max-w-[1360px] px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14"
        style={{ ["--px" as string]: 0, ["--py" as string]: 0 }}
      >
        {/* the board itself: a big sheet of cream stock on the cork */}
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-full w-full max-w-[1320px] bg-[#f4ede1]/95 shadow-[var(--shadow-lift)] md:block"
            aria-hidden
          />

          <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-0 pt-0 md:min-h-[660px] md:pt-12">
            {/* WORDPRESS SCRAP */}
            <div
              {...dragProps("wordmark")}
              className="relative z-20 w-full max-w-[620px] cursor-grab touch-none select-none active:cursor-grabbing md:ml-6"
              style={{
                ...layer("wordmark", 0.35),
                transform: `${layer("wordmark", 0.35).transform} rotate(-1.4deg) translate(${
                  offsets.wordmark.x
                }px, ${offsets.wordmark.y}px)`,
              }}
            >
              <Tape className="-left-6 -top-4 z-30" rotate={-24} width={136} height={38} />
              <Tape className="-right-4 top-2 z-30" rotate={14} width={92} height={30} />
              <div className="relative bg-paper px-6 py-7 shadow-[var(--shadow-lift)] sm:px-10 sm:py-10">
                <span className="label">Fort Mason · Pier 2 · San Francisco</span>
                <h1
                  id="wall-heading"
                  className="mt-3 font-serif text-[3.1rem] leading-[0.86] sm:text-[4.6rem] md:text-[5.4rem]"
                >
                  Founders,
                  <br />
                  Inc. Clubs
                </h1>
                <p className="scrawl mt-4 max-w-[34ch] text-xl sm:text-2xl">
                  a wall to poke around in, and a table to cut your own.
                </p>
                <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink/70">
                  Track days, workshop nights, pickup runs and field days, run by members of the
                  Pier 2 campus. Nothing on this board is a networking event.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href="#roster" className="pill-btn">
                    See the wall ↓
                  </a>
                  {nextEvent ? (
                    <a href={nextEvent.rsvpUrl} target="_blank" rel="noreferrer" className="pill-btn-secondary">
                      RSVP · {formatMonthDay(nextEvent.datetime)} ↗
                    </a>
                  ) : (
                    <Link href="/clubs/calendar" className="pill-btn-secondary">
                      Calendar →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* the rest of the board */}
            <div className="relative z-10 md:absolute md:inset-0">
              {/* handwritten note */}
              <div
                {...dragProps("note")}
                className="relative z-20 mt-8 w-[220px] cursor-grab touch-none select-none sm:w-[260px] md:absolute md:right-[3%] md:top-[6%] md:mt-0"
                style={{
                  transform: `${layer("note", 0.75).transform} rotate(2.4deg) translate(${
                    offsets.note.x
                  }px, ${offsets.note.y}px)`,
                }}
              >
                <Tape className="-left-8 -top-3 z-30" rotate={-8} width={104} height={30} />
                <div className="bg-white/70 p-2 shadow-[var(--shadow-scrap)]">
                  <Image
                    src="/collage/scrap-note.webp"
                    alt="Handwritten note: Track day, Sat 7am, convoy from Pier 2"
                    width={1024}
                    height={1024}
                    sizes="260px"
                    className="w-full"
                  />
                </div>
              </div>

              {/* magazine cut-outs, multiply so the print sits in the paper */}
              <div
                {...dragProps("helmet")}
                className="relative z-10 mt-8 hidden cursor-grab touch-none select-none sm:block md:absolute md:right-[16%] md:top-[46%] md:mt-0"
                style={{
                  transform: `${layer("helmet", 1).transform} rotate(-5deg) translate(${
                    offsets.helmet.x
                  }px, ${offsets.helmet.y}px)`,
                }}
              >
                <Image
                  src="/collage/cutout-helmet.webp"
                  alt="Magazine cut-out of a 1970s racing helmet"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 768px) 40vw, 300px"
                  className="sticker-img w-[200px] md:w-[268px]"
                />
              </div>

              <div
                {...dragProps("sneaker")}
                className="relative z-10 mt-8 hidden cursor-grab touch-none select-none sm:block md:absolute md:right-[2%] md:top-[68%] md:mt-0"
                style={{
                  transform: `${layer("sneaker", 0.9).transform} rotate(4.5deg) translate(${
                    offsets.sneaker.x
                  }px, ${offsets.sneaker.y}px)`,
                }}
              >
                <Image
                  src="/collage/cutout-sneaker.webp"
                  alt="Magazine cut-out of a worn basketball sneaker"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 768px) 40vw, 280px"
                  className="sticker-img w-[180px] md:w-[240px]"
                />
              </div>

              {/* club stickers, pinned to the board */}
              <div
                {...dragProps("badge-cars")}
                className="relative z-20 mt-8 w-[140px] cursor-grab touch-none select-none sm:w-[160px] md:absolute md:bottom-[6%] md:left-[11%] md:mt-0"
                style={{
                  transform: `${layer("badge-cars", 1.2).transform} rotate(-8deg) translate(${
                    offsets["badge-cars"].x
                  }px, ${offsets["badge-cars"].y}px)`,
                }}
              >
                <Tape className="-top-3 left-1/2 z-30 -translate-x-1/2" rotate={-4} width={70} height={24} />
                <Image
                  src="/collage/sticker-cars.webp"
                  alt="Car Club sticker: orange racing helmet"
                  width={1024}
                  height={1024}
                  sizes="160px"
                  className="sticker-img w-full"
                />
              </div>

              <div
                {...dragProps("badge-hoops")}
                className="relative z-20 mt-8 ml-auto w-[132px] cursor-grab touch-none select-none sm:w-[150px] md:absolute md:bottom-[3%] md:right-[30%] md:mt-0"
                style={{
                  transform: `${layer("badge-hoops", 0.6).transform} rotate(7deg) translate(${
                    offsets["badge-hoops"].x
                  }px, ${offsets["badge-hoops"].y}px)`,
                }}
              >
                <Image
                  src="/collage/sticker-hoops.webp"
                  alt="Basketball Club sticker: chain-link hoop"
                  width={1024}
                  height={1024}
                  sizes="150px"
                  className="sticker-img w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-20 mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f0e4d2]/80">
          Drag a scrap, or tab to it and use the arrow keys · press R to put it back
        </p>
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>
      </div>
    </section>
  );
}
