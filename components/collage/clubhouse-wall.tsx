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
  "badge-hardware": { x: 0, y: 0 },
  "badge-paintball": { x: 0, y: 0 },
  charter: { x: 0, y: 0 },
};

/** Resting clamp only. A scrap being carried is never clamped — it has to be
    able to leave the paper for the drag-off gesture to mean anything. */
const REST_LIMIT = 90;
/** How far the pointer must travel before a press becomes a drag, so that the
    links and buttons printed on a scrap still count as clicks. */
const DRAG_THRESHOLD = 4;
/** How far a scrap must actually travel before a taped drop-zone may claim it.
    A short nudge that starts on top of a zone must move the scrap, not open a
    page — zones are deliberate targets, not things you brush past. */
const ZONE_TRAVEL = 32;

type DragState = {
  id: ScrapId;
  pointerId: number;
  startX: number;
  startY: number;
  ox: number;
  oy: number;
  /** true once the press has travelled past DRAG_THRESHOLD */
  live: boolean;
  /** a press that never travelled is a click, not a drag */
  moved: boolean;
  captured: boolean;
  /** where the pressed scrap sat when the press began */
  homeRect: DOMRect | null;
  overZone: DragZone | null;
  beyondEdge: boolean;
};

function clampRest(value: number): number {
  return Math.max(-REST_LIMIT, Math.min(REST_LIMIT, value));
}

/** The roster, pinned along the bottom of the board — one sticker per club,
    each carried off the wall to its own page. This rail is the only place the
    landing page names all four clubs, so it is also the `#roster` target. */
const clubBadges: {
  id: ScrapId;
  name: string;
  src: string;
  rotate: number;
  depth: number;
  tape: number;
}[] = [
  { id: "badge-cars", name: "Car Club", src: "/collage/sticker-cars.webp", rotate: -3.5, depth: 1.2, tape: -4 },
  { id: "badge-hoops", name: "Basketball", src: "/collage/sticker-hoops.webp", rotate: 2.8, depth: 0.6, tape: 9 },
  { id: "badge-hardware", name: "Hardware", src: "/collage/sticker-hardware.webp", rotate: -2.2, depth: 0.9, tape: -9 },
  { id: "badge-paintball", name: "Paintball", src: "/collage/sticker-paintball.webp", rotate: 3.2, depth: 0.7, tape: 7 },
];

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
        live: false,
        moved: false,
        captured: false,
        homeRect: el.getBoundingClientRect(),
        overZone: null,
        beyondEdge: false,
      };
      // Touch has no hover, so the capture happens on press; the scrap only
      // counts as picked up once the finger has actually travelled.
      if (event.pointerType !== "mouse") {
        try {
          el.setPointerCapture(event.pointerId);
          drag.current.captured = true;
        } catch {
          /* capture is a nicety; the element still receives the moves */
        }
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
        state.moved = true;
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
      // A zone only counts once the pointer has travelled far enough to read as
      // a carry, and has left the footprint the scrap started in. Otherwise the
      // zone sitting under a sticker would swallow a tiny nudge.
      const travelled = Math.hypot(dx, dy) >= ZONE_TRAVEL;
      const home = state.homeRect;
      const stillHome =
        !!home &&
        event.clientX >= home.left &&
        event.clientX <= home.right &&
        event.clientY >= home.top &&
        event.clientY <= home.bottom;
      const zone = travelled && !stillHome ? zoneAt(event.clientX, event.clientY) : null;
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
      // A press that never travelled is a click: peel the sticker off, i.e. open
      // the page it belongs to. The hero sheet is exempt — its own links and
      // buttons do the talking, and it would only navigate to itself.
      if (!state.live && id !== "wordmark") {
        setAnnounce(`Opening ${scrapLabels[id]} — ${destinations[id]}.`);
        resetOne(id);
        go(destinations[id]);
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
    "aria-label": `${scrapLabels[id]} — click or press Enter to open ${destinations[id]}, drag it to move it, arrow keys to nudge, R to put it back`,
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
      className="relative flex w-full flex-1 flex-col overflow-hidden border-b border-line/60"
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
        className="relative mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14"
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

          <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-0 pt-0 md:min-h-[560px] md:pt-8 xl:grid xl:min-h-[560px] xl:grid-cols-[minmax(0,620px)_minmax(0,1fr)_minmax(0,1fr)] xl:grid-rows-[auto_auto_auto] xl:gap-x-6 xl:gap-y-8 pb-24 md:pb-28 xl:pb-14">
            {/* THE WORDPRESS SCRAP */}
            <div
              {...dragProps("wordmark", "pan-y")}
              className={`relative z-20 w-full max-w-[620px] cursor-grab select-none active:cursor-grabbing xl:col-start-1 xl:col-end-2 xl:row-start-1 xl:row-span-2 xl:self-start xl:justify-self-start ${
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
                    The four clubs ↓
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
            <div className="relative z-10 xl:contents">
              {/* handwritten note */}
              <div
                {...dragProps("note")}
                className={`relative z-20 mt-8 w-[220px] cursor-grab select-none sm:w-[260px] xl:mt-0 xl:col-start-2 xl:row-start-1 xl:justify-self-end xl:self-start ${
                  active === "note" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(0.75)} rotate(1.6deg) translate(${offsets.note.x}px, ${offsets.note.y}px)`,
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
                className={`relative z-10 mt-8 hidden w-fit cursor-grab select-none sm:block xl:mt-0 xl:col-start-3 xl:row-start-1 xl:justify-self-start xl:self-center ${
                  active === "helmet" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(1)} rotate(-3deg) translate(${offsets.helmet.x}px, ${offsets.helmet.y}px)`,
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
                className={`relative z-10 mt-8 hidden w-fit cursor-grab select-none sm:block xl:mt-0 xl:col-start-2 xl:col-end-4 xl:row-start-2 xl:justify-self-center xl:self-center ${
                  active === "sneaker" ? "z-40" : ""
                }`}
                style={{
                  touchAction: "none",
                  transform: `${layer(0.9)} rotate(3deg) translate(${offsets.sneaker.x}px, ${offsets.sneaker.y}px)`,
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

              {/* the roster rail — every club on the wall, sticker + name */}
              <div
                id="roster"
                className="relative z-20 mt-8 flex scroll-mt-24 flex-wrap items-end justify-center gap-x-6 gap-y-5 sm:justify-start xl:col-span-3 xl:row-start-3 xl:mt-0 xl:items-end xl:justify-between xl:gap-4"
              >
                {clubBadges.map((badge) => {
                  const id = badge.id;
                  return (
                    <div
                      key={badge.id}
                      {...dragProps(id)}
                      className={`group relative w-[124px] cursor-grab select-none sm:w-[140px] xl:w-[150px] ${
                        active === id ? "z-40" : ""
                      }`}
                      style={{
                        touchAction: "none",
                        transform: `${layer(badge.depth)} rotate(${badge.rotate}deg) translate(${offsets[id].x}px, ${offsets[id].y}px)`,
                      }}
                    >
                      <Tape
                        className="left-1/2 top-[-10px] z-30 -translate-x-1/2"
                        rotate={badge.tape}
                        width={66}
                        height={22}
                      />
                      <Image
                        src={badge.src}
                        alt={`${badge.name} sticker`}
                        width={1024}
                        height={1024}
                        sizes="150px"
                        draggable={false}
                        onDragStart={(event) => event.preventDefault()}
                        className="sticker-img pointer-events-none w-full select-none transition-transform duration-300 ease-[var(--ease-paper)] motion-reduce:transition-none group-hover:rotate-[-1.5deg]"
                      />
                      <span className="mt-1.5 block text-center font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                        {badge.name}
                      </span>
                    </div>
                  );
                })}

                {/* the index card that charters a new club */}
                <div
                  {...dragProps("charter")}
                  className={`relative w-[176px] cursor-grab select-none sm:w-[186px] xl:w-[180px] ${
                    active === "charter" ? "z-40" : ""
                  }`}
                  style={{
                    touchAction: "none",
                    transform: `${layer(0.5)} rotate(-2deg) translate(${offsets.charter.x}px, ${offsets.charter.y}px)`,
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
        </div>

        <p className="relative z-20 mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Click a scrap and it peels off the wall and opens its page · or drag one across the paper,
          drop it on a taped zone, or carry it off the edge · arrow keys nudge · R puts it back
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
