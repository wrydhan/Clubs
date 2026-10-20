"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tape } from "@/components/collage/paper";
import { dragZones, scrapHrefs, scrapLabels, type DragZone, type ScrapId } from "@/lib/collage";
import type { ClubEvent } from "@/lib/clubs";
import { formatMonthDay } from "@/lib/format";

const START: Record<ScrapId, { x: number; y: number }> = {
  wordmark: { x: 0, y: 0 },
  note: { x: 0, y: 0 },
  helmet: { x: 0, y: 0 },
  sneaker: { x: 0, y: 0 },
  "badge-cars": { x: 0, y: 0 },
  "badge-hoops": { x: 0, y: 0 },
  charter: { x: 0, y: 0 },
};

/** Resting clamp only. A scrap being carried is never clamped — it has to be
    able to leave the paper for the drag-off gesture to mean anything. */
const REST_LIMIT = 90;
/** How far the pointer must travel before a press becomes a drag, so that the
    links and buttons printed on a scrap still count as clicks. */
const DRAG_THRESHOLD = 4;

type DragState = {
  id: ScrapId;
  pointerId: number;
  startX: number;
  startY: number;
  ox: number;
  oy: number;
  /** true once the press has travelled past DRAG_THRESHOLD */
  live: boolean;
  captured: boolean;
  overZone: DragZone | null;
  beyondEdge: boolean;
};

function clampRest(value: number): number {
  return Math.max(-REST_LIMIT, Math.min(REST_LIMIT, value));
}

const prefersFullUrl = (href: string) => /^(https?:)?\/\//.test(href);

export function ClubhouseWall({ nextEvent }: { nextEvent?: ClubEvent }) {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const zoneRefs = useRef<Partial<Record<DragZone["id"], HTMLElement | null>>>({});
  const [offsets, setOffsets] = useState<Record<ScrapId, { x: number; y: number }>>(START);
  const [active, setActive] = useState<ScrapId | null>(null);
  const [hoverZone, setHoverZone] = useState<DragZone["id"] | null>(null);
  const [beyond, setBeyond] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const drag = useRef<DragState | null>(null);

  // The note promises the next session, so it carries you to that RSVP.
  const destinations = useMemo<Record<ScrapId, string>>(
    () => ({
      ...scrapHrefs,
      note: nextEvent?.rsvpUrl ?? scrapHrefs.note,
    }),
    [nextEvent],
  );

  /** The zone a scrap is hovering, or `null`. Read from live rects, no state. */
  const zoneAt = useCallback((x: number, y: number): DragZone | null => {
    for (const zone of dragZones) {
      const el = zoneRefs.current[zone.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return zone;
    }
    return null;
  }, []);

  const outsideBoard = useCallback((x: number, y: number): boolean => {
    const board = boardRef.current;
    if (!board) return false;
    const rect = board.getBoundingClientRect();
    const margin = 16;
    return (
      x < rect.left - margin ||
      x > rect.right + margin ||
      y < rect.top - margin ||
      y > rect.bottom + margin
    );
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // pointer parallax driven through CSS vars so it never re-renders React,
  // and suspended entirely while a scrap is in hand.
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
      if (drag.current) return;
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

  // Esc always puts the scrap back, whichever input got it there.
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const current = drag.current;
      drag.current = null;
      setActive(null);
      setHoverZone(null);
      setBeyond(false);
      if (current) {
        setOffsets((prev) => ({ ...prev, [current.id]: { x: 0, y: 0 } }));
        setAnnounce(`${scrapLabels[current.id]} put back on the wall.`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const go = useCallback(
    (href: string) => {
      if (prefersFullUrl(href)) {
        window.location.assign(href);
        return;
      }
      router.push(href);
    },
    [router],
  );

  const resetOne = useCallback((id: ScrapId) => {
    setOffsets((current) => ({ ...current, [id]: { x: 0, y: 0 } }));
  }, []);

  const move = useCallback((id: ScrapId, dx: number, dy: number) => {
    setOffsets((current) => ({
      ...current,
      [id]: {
        x: clampRest(current[id].x + dx),
        y: clampRest(current[id].y + dy),
      },
    }));
  }, []);

  /** A press that lands on a link, button or field belongs to that control. */
  function isInteractive(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || typeof el.closest !== "function") return false;
    return Boolean(el.closest("a, button, input, textarea, select, label, [role='button']"));
  }

  function onPointerDown(id: ScrapId) {
    return (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      if (isInteractive(event.target)) return;
      const el = event.currentTarget;
      drag.current = {
        id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        ox: offsets[id].x,
        oy: offsets[id].y,
        // Touch has no hover: a touch press is a drag straight away, and the
        // capture has to happen now so the finger keeps steering the scrap.
        live: event.pointerType !== "mouse",
        captured: false,
        overZone: null,
        beyondEdge: false,
      };
      if (drag.current.live) {
        el.setPointerCapture(event.pointerId);
        drag.current.captured = true;
        setActive(id);
      }
    };
  }

  function onPointerMove(id: ScrapId) {
    return (event: React.PointerEvent<HTMLElement>) => {
      const state = drag.current;
      if (!state || state.id !== id || state.pointerId !== event.pointerId) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (!state.live) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        state.live = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
          state.captured = true;
        } catch {
          /* capture is a nicety; the element still receives the moves */
        }
        setActive(id);
      }
      // Unclamped while it is in hand: the scrap must be able to leave the wall.
      setOffsets((current) => ({
        ...current,
        [id]: { x: state.ox + dx, y: state.oy + dy },
      }));
      const zone = zoneAt(event.clientX, event.clientY);
      const outside = outsideBoard(event.clientX, event.clientY);
      state.overZone = zone;
      state.beyondEdge = outside;
      setHoverZone(zone ? zone.id : null);
      setBeyond(outside);
    };
  }

  function endDrag(id: ScrapId) {
    return (event: React.PointerEvent<HTMLElement>) => {
      const state = drag.current;
      if (!state || state.id !== id) return;
      drag.current = null;
      if (state.captured) {
        try {
          event.currentTarget.releasePointerCapture(state.pointerId);
        } catch {
          /* already released */
        }
      }
      setActive(null);
      setHoverZone(null);
      setBeyond(false);

      // Dropping on a taped zone wins; otherwise leaving the paper counts.
      const zone = state.overZone;
      if (zone) {
        setAnnounce(`Opening ${zone.label}.`);
        resetOne(id);
        go(zone.href);
        return;
      }
      if (state.beyondEdge) {
        const href = destinations[id];
        setAnnounce(`Carried ${scrapLabels[id]} off the wall — opening ${href.replace(/^https?:\/\//, "")}.`);
        resetOne(id);
        go(href);
        return;
      }
      // Dropped back inside: settle home and clamp so it stays on the paper.
      setOffsets((current) => ({
        ...current,
        [id]: {
          x: clampRest(current[id].x),
          y: clampRest(current[id].y),
        },
      }));
      if (state.live) setAnnounce(`${scrapLabels[id]} moved.`);
    };
  }

  function onLostCapture(id: ScrapId) {
    return () => {
      const state = drag.current;
      if (!state || state.id !== id) return;
      drag.current = null;
      setActive(null);
      setHoverZone(null);
      setBeyond(false);
      setOffsets((current) => ({
        ...current,
        [id]: { x: clampRest(current[id].x), y: clampRest(current[id].y) },
      }));
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
        resetOne(id);
        setAnnounce(`${scrapLabels[id]} put back.`);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setAnnounce(`Opening ${destinations[id]}.`);
        go(destinations[id]);
        return;
      }
      const delta = map[event.key];
      if (!delta) return;
      event.preventDefault();
      move(id, delta[0], delta[1]);
      setAnnounce(`${scrapLabels[id]} moved.`);
    };
  }

  /** Both the wrapper and every image inside it refuse the native image drag. */
  const noNativeDrag = {
    onDragStart: (event: React.DragEvent<HTMLElement>) => event.preventDefault(),
  } as const;

  const dragProps = (id: ScrapId, touchAction: "none" | "pan-y" = "none") => ({
    onPointerDown: onPointerDown(id),
    onPointerMove: onPointerMove(id),
    onPointerUp: endDrag(id),
    onPointerCancel: endDrag(id),
    onLostPointerCapture: onLostCapture(id),
    onKeyDown: onKeyDown(id),
    onDragStart: noNativeDrag.onDragStart,
    tabIndex: 0,
    role: "group" as const,
    draggable: false as const,
    "aria-label": `${scrapLabels[id]} — drag it to move it, arrow keys to nudge, R to put it back, Enter to open ${destinations[id]}`,
    "data-dragging": active === id || undefined,
    style: { touchAction, WebkitUserSelect: "none" as const },
  });

  const layer = (depth: number) =>
    `translate3d(calc(var(--px, 0) * ${depth * 26}px), calc(var(--py, 0) * ${
      depth * 18
    }px), 0)`;

  const dragging = active !== null;

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
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
          className="pointer-events-none object-cover select-none"
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

          {/* the four taped drop-zones, revealed only while something is in hand */}
          <div
            aria-hidden={!dragging}
            className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-200 ease-[var(--ease-paper)] motion-reduce:transition-none ${
              dragging ? "opacity-100" : "opacity-0"
            }`}
          >
            {dragZones.map((zone, index) => {
              const hot = hoverZone === zone.id;
              const parked = dragging && !hoverZone && beyond;
              const place = [
                "left-3 top-3",
                "right-3 top-3",
                "bottom-3 left-3",
                "bottom-3 right-3",
              ][index];
              return (
                <div
                  key={zone.id}
                  ref={(el) => {
                    zoneRefs.current[zone.id] = el;
                  }}
                  className={`absolute ${place} ${drivingStyle(hot, dragging)}`}
                >
                  <Tape className="-top-2 left-4 z-10" rotate={index % 2 ? 8 : -12} width={58} height={18} />
                  <div
                    className={`flex min-w-[9.5rem] flex-col gap-0.5 px-4 py-2.5 transition-transform duration-150 ease-[var(--ease-paper)] motion-reduce:transition-none ${
                      hot
                        ? "-translate-y-0.5 bg-ink text-paper shadow-[var(--shadow-lift)]"
                        : "bg-paper text-ink shadow-[var(--shadow-scrap)]"
                    } ${parked ? "opacity-90" : ""}`}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-70">
                      drop to open
                    </span>
                    <span className="font-serif text-lg leading-none">{zone.label}</span>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                        hot ? "text-paper/70" : "text-ink-3"
                      }`}
                    >
                      {zone.hint}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-0 pt-0 md:min-h-[660px] md:pt-12">
            {/* THE WORDPRESS SCRAP */}
            <div
              {...dragProps("wordmark", "pan-y")}
              className={`relative z-20 w-full max-w-[620px] cursor-grab select-none active:cursor-grabbing md:ml-6 ${
                active === "wordmark" ? "z-40 cursor-grabbing" : ""
              }`}
              style={{
                touchAction: "pan-y",
                transform: `${layer(0.35)} rotate(-1.4deg) translate(${offsets.wordmark.x}px, ${offsets.wordmark.y}px)`,
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
                  a wall to poke around in, and a studio to cut your own.
                </p>
                <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2">
                  Track days, workshop nights, pickup runs and field days, run by members of the
                  Pier 2 campus. Nothing on this board is a networking event.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href="#roster" className="pill-btn">
                    See the wall ↓
                  </a>
                  {nextEvent ? (
                    <a
                      href={nextEvent.rsvpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="pill-btn-secondary"
                    >
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
                className={`relative z-20 mt-8 w-[220px] cursor-grab select-none sm:w-[260px] md:absolute md:right-[3%] md:top-[6%] md:mt-0 ${
                  active === "note" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(0.75)} rotate(2.4deg) translate(${offsets.note.x}px, ${offsets.note.y}px)`,
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
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    className="pointer-events-none w-full select-none"
                  />
                </div>
              </div>

              {/* magazine cut-outs, multiply so the print sits in the paper */}
              <div
                {...dragProps("helmet")}
                className={`relative z-10 mt-8 hidden cursor-grab select-none sm:block md:absolute md:right-[16%] md:top-[46%] md:mt-0 ${
                  active === "helmet" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(1)} rotate(-5deg) translate(${offsets.helmet.x}px, ${offsets.helmet.y}px)`,
                }}
              >
                <Image
                  src="/collage/cutout-helmet.webp"
                  alt="Magazine cut-out of a 1970s racing helmet"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 768px) 40vw, 300px"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="sticker-img pointer-events-none w-[200px] select-none md:w-[268px]"
                />
              </div>

              <div
                {...dragProps("sneaker")}
                className={`relative z-10 mt-8 hidden cursor-grab select-none sm:block md:absolute md:right-[2%] md:top-[68%] md:mt-0 ${
                  active === "sneaker" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(0.9)} rotate(4.5deg) translate(${offsets.sneaker.x}px, ${offsets.sneaker.y}px)`,
                }}
              >
                <Image
                  src="/collage/cutout-sneaker.webp"
                  alt="Magazine cut-out of a worn basketball sneaker"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 768px) 40vw, 280px"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="sticker-img pointer-events-none w-[180px] select-none md:w-[240px]"
                />
              </div>

              {/* club stickers, pinned to the board */}
              <div
                {...dragProps("badge-cars")}
                className={`relative z-20 mt-8 w-[140px] cursor-grab select-none sm:w-[160px] md:absolute md:bottom-[6%] md:left-[11%] md:mt-0 ${
                  active === "badge-cars" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(1.2)} rotate(-8deg) translate(${offsets["badge-cars"].x}px, ${offsets["badge-cars"].y}px)`,
                }}
              >
                <Tape className="-top-3 left-1/2 z-30 -translate-x-1/2" rotate={-4} width={70} height={24} />
                <Image
                  src="/collage/sticker-cars.webp"
                  alt="Car Club sticker: orange racing helmet"
                  width={1024}
                  height={1024}
                  sizes="160px"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="sticker-img pointer-events-none w-full select-none"
                />
              </div>

              <div
                {...dragProps("badge-hoops")}
                className={`relative z-20 mt-8 ml-auto w-[132px] cursor-grab select-none sm:w-[150px] md:absolute md:bottom-[3%] md:right-[30%] md:mt-0 ${
                  active === "badge-hoops" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(0.6)} rotate(7deg) translate(${offsets["badge-hoops"].x}px, ${offsets["badge-hoops"].y}px)`,
                }}
              >
                <Image
                  src="/collage/sticker-hoops.webp"
                  alt="Basketball Club sticker: chain-link hoop"
                  width={1024}
                  height={1024}
                  sizes="150px"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="sticker-img pointer-events-none w-full select-none"
                />
              </div>

              {/* the index card that charters a new club */}
              <div
                {...dragProps("charter")}
                className={`relative z-20 mt-8 w-[190px] cursor-grab select-none md:absolute md:bottom-[10%] md:left-[40%] md:mt-0 ${
                  active === "charter" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(0.5)} rotate(-2.6deg) translate(${offsets.charter.x}px, ${offsets.charter.y}px)`,
                }}
              >
                <Tape className="-right-6 -top-3 z-30" rotate={18} width={78} height={24} />
                <div className="bg-paper px-4 py-3 shadow-[var(--shadow-scrap)]">
                  <span className="label">index card · 3×5</span>
                  <p className="scrawl mt-1 text-[1.35rem] leading-[1.02]">Start a club</p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                    cut your own sticky →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-20 mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Drag a scrap across the wall — drop it on a taped zone, or carry it off the paper to open
          that page · arrow keys nudge · R puts it back
        </p>
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>
      </div>
    </section>
  );
}

/** Keeps the hot/parked zone classes readable inside the map above. */
function drivingStyle(hot: boolean, dragging: boolean): string {
  return `transition-[transform,opacity] duration-150 ease-[var(--ease-paper)] motion-reduce:transition-none ${
    hot ? "scale-[1.04]" : dragging ? "scale-100" : "scale-95"
  }`;
}
