"use client";

/**
 * The hallway — the Clubs entrance at `/clubs`.
 *
 * Two layers, one page:
 *
 *   ≥768px  the 3D corridor (lazily imported, see `hallway-corridor.tsx`): scroll
 *           dollies the eye down a real CSS-3D corridor, overshoots the pinboard,
 *           turns back and settles with the board filling the frame.
 *   <768px  the corridor does not run at all — the spec forbids it on phones. The
 *           page is a still of the hallway at walking eye level (drawn in single-
 *           point perspective, no 3D, no chunk) and then the board as a normal
 *           scrollable grid. The 3D chunk is never fetched at that width.
 *
 * Below both: the board itself is server-rendered DOM — the content layer, crawlable
 * and keyboard-reachable, and the elements that open the flyer sheet.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pin } from "@/components/collage/paper";
import type { HallwayClub } from "./types";

export type { HallwayClub };

const Corridor = dynamic(() => import("./hallway-corridor"), { ssr: false });

/* ------------------------------------------------------- the still (phones) */

/* Single-point perspective for the poster: `t` runs 0 (near edge) → 1 (end wall),
   and every surface is a lerp toward the far frame, so the vanishing point is real
   rather than drawn on. */
const VP = { x: 395, y: 240 };
const FAR = { x0: 330, x1: 460, y0: 200, y1: 280 };
const W = 720;
const H = 480;

const wallY = (v: number, t: number) => VP.y + (v - VP.y) * (1 - (200 / 240) * t);
const leftX = (t: number) => FAR.x0 * t;
const rightX = (t: number) => W - (W - FAR.x1) * t;
const floorY = (t: number) => H - (H - FAR.y1) * t;
const ceilY = (t: number) => FAR.y0 * t;
const floorX = (xn: number, t: number) => xn + (VP.x + (xn - VP.x) * (40 / 240) - xn) * t;

const quad = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function HallwayStill({ clubs }: { clubs: HallwayClub[] }) {
  // window run on the left wall, three openings that taper with the wall
  const windows = [0.04, 0.34, 0.62].map((t0) => {
    const t1 = t0 + 0.2;
    return quad([
      [leftX(t0), wallY(96, t0)],
      [leftX(t1), wallY(96, t1)],
      [leftX(t1), wallY(300, t1)],
      [leftX(t0), wallY(300, t0)],
    ]);
  });

  // the light those windows throw across the floor
  const pools = [0.06, 0.36, 0.64].map((t0) => {
    const t1 = t0 + 0.16;
    return quad([
      [floorX(30, t0), floorY(t0)],
      [floorX(250, t0), floorY(t0)],
      [floorX(250, t1), floorY(t1)],
      [floorX(30, t1), floorY(t1)],
    ]);
  });

  return (
    <section aria-label="The hallway" className="relative overflow-hidden bg-[#e6dbc9] px-4 pb-10 pt-4 sm:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            second floor · hallway east
          </p>
          <a
            href="#board"
            className="pill-btn-secondary inline-flex min-h-[40px] shrink-0 items-center px-4 text-[11px]"
          >
            Skip to the board ↓
          </a>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[15px] shadow-[var(--shadow-lift)]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="The Pier 2 hallway, seen at walking eye level: a window run on the left, lockers on the right, and the club pinboard at the far end."
            className="block h-auto w-full"
          >
            <defs>
              <linearGradient id="hall-haze" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff8e4" stopOpacity="0.5" />
                <stop offset="46%" stopColor="#fff8e4" stopOpacity="0" />
                <stop offset="100%" stopColor="#241a15" stopOpacity="0.16" />
              </linearGradient>
              <radialGradient id="hall-warm" cx="18%" cy="42%" r="70%">
                <stop offset="0%" stopColor="#fff8e4" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fff8e4" stopOpacity="0" />
              </radialGradient>
              <pattern id="hall-boards" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="rgba(64,46,30,0.18)" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width={W} height={H} fill="#ddccae" />

            {/* ceiling */}
            <polygon points={quad([[0, 0], [W, 0], [FAR.x1, FAR.y0], [FAR.x0, FAR.y0]])} fill="#f0e7d8" />
            {[0.22, 0.5, 0.74].map((t) => {
              const t1 = t + 0.1;
              return (
                <polygon
                  key={`light-${t}`}
                  points={quad([
                    [floorX(300, t), ceilY(t)],
                    [floorX(420, t), ceilY(t)],
                    [floorX(420, t1), ceilY(t1)],
                    [floorX(300, t1), ceilY(t1)],
                  ])}
                  fill="#fffdf4"
                  opacity="0.95"
                />
              );
            })}

            {/* floor */}
            <polygon points={quad([[0, H], [W, H], [FAR.x1, FAR.y1], [FAR.x0, FAR.y1]])} fill="#ddccae" />
            <polygon
              points={quad([[0, H], [W, H], [FAR.x1, FAR.y1], [FAR.x0, FAR.y1]])}
              fill="url(#hall-boards)"
              opacity="0.5"
            />
            {pools.map((points, i) => (
              <polygon key={`pool-${i}`} points={points} fill="#fff6da" opacity="0.45" />
            ))}

            {/* left wall: windows */}
            <polygon points={quad([[0, 0], [FAR.x0, FAR.y0], [FAR.x0, FAR.y1], [0, H]])} fill="#d8c6a9" />
            <polygon points={quad([[0, 0], [FAR.x0, FAR.y0], [FAR.x0, FAR.y1], [0, H]])} fill="#b39a78" opacity="0.28" />
            {windows.map((points, i) => (
              <g key={`win-${i}`}>
                <polygon points={points} fill="#fffcf0" opacity="0.95" />
                <polygon points={points} fill="none" stroke="rgba(72,52,33,0.45)" strokeWidth="2" />
              </g>
            ))}
            {/* left wall doors */}
            {[0.18, 0.46, 0.72].map((t) => {
              const t1 = t + 0.09;
              return (
                <polygon
                  key={`door-${t}`}
                  points={quad([
                    [leftX(t), wallY(300, t)],
                    [leftX(t1), wallY(300, t1)],
                    [leftX(t1), wallY(430, t1)],
                    [leftX(t), wallY(430, t)],
                  ])}
                  fill="#8a6b4d"
                />
              );
            })}

            {/* right wall: lockers */}
            <polygon points={quad([[W, 0], [FAR.x1, FAR.y0], [FAR.x1, FAR.y1], [W, H]])} fill="#d9c8ac" />
            <polygon
              points={quad([[W, 0], [FAR.x1, FAR.y0], [FAR.x1, FAR.y1], [W, H]])}
              fill="#b39a78"
              opacity="0.2"
            />
            <polygon
              points={quad([
                [W, wallY(150, 0)],
                [FAR.x1, wallY(150, 1)],
                [FAR.x1, wallY(370, 1)],
                [W, wallY(370, 0)],
              ])}
              fill="#708478"
              opacity="0.32"
            />
            {[0.12, 0.26, 0.4, 0.54, 0.68, 0.82].map((t) => (
              <line
                key={`locker-${t}`}
                x1={rightX(t)}
                y1={wallY(150, t)}
                x2={rightX(t)}
                y2={wallY(370, t)}
                stroke="rgba(52,58,52,0.35)"
                strokeWidth="2"
              />
            ))}

            {/* end wall: fire door + the pinboard */}
            <rect
              x={FAR.x0}
              y={FAR.y0}
              width={FAR.x1 - FAR.x0}
              height={FAR.y1 - FAR.y0}
              fill="#cdbb9f"
            />
            <rect x={VP.x - 22} y={FAR.y0 + 22} width={44} height={FAR.y1 - FAR.y0 - 22} fill="#7a5c40" />
            <rect x={VP.x - 22} y={FAR.y1 - 52} width={44} height={12} fill="#1f6b4a" />
            {/* the board, on the end wall, four sheets pinned */}
            <rect x={FAR.x0 + 6} y={FAR.y0 + 8} width={72} height={46} fill="#6b4b2e" />
            <rect x={FAR.x0 + 9} y={FAR.y0 + 11} width={66} height={40} fill="#7a5836" />
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={`sheet-${i}`}
                x={FAR.x0 + 13 + (i % 2) * 33}
                y={FAR.y0 + 15 + Math.floor(i / 2) * 18}
                width={28}
                height={15}
                fill="#fdfbf4"
                transform={`rotate(${i % 2 ? 1.6 : -2} ${FAR.x0 + 27 + (i % 2) * 33} ${FAR.y0 + 22 + Math.floor(i / 2) * 18})`}
              />
            ))}

            <rect width={W} height={H} fill="url(#hall-warm)" />
            <rect width={W} height={H} fill="url(#hall-haze)" />
          </svg>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3">
            <span className="bg-paper/92 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft shadow-[var(--shadow-scrap)]">
              the board is at the end of the hall · {clubs.length} sheets
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <p className="max-w-[30ch] font-serif text-[1.55rem] leading-[0.95] text-ink">
            The hallway, at walking eye level.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">
            tap a flyer to unpin it ↓
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ the fallback shell */

/** Painted before the corridor chunk lands, at the corridor's exact height, so
    mounting it shifts nothing. */
function StageShell() {
  return <div aria-hidden className="h-[calc(100dvh-4rem)] bg-[#e6dbc9] md:h-[calc(190dvh-4rem)]" />;
}

/* ------------------------------------------------------------------- the flyer */

const TILT = [-2.6, 3.1, 1.9, -3.4];

function Flyer({
  club,
  index,
  variant,
  onOpen,
}: {
  club: HallwayClub;
  index: number;
  variant: "board" | "stack";
  onOpen: () => void;
}) {
  const board = variant === "board";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative block w-full text-left focus-visible:outline-none"
      style={{ transform: `rotate(${TILT[index % TILT.length]}deg)` }}
    >
      <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
        <Pin />
      </span>
      <span
        className="torn-soft flex h-full w-full flex-col bg-paper shadow-[var(--shadow-lift)] transition-transform duration-200 ease-[var(--ease-paper)] group-hover:-translate-y-1.5 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-ink motion-reduce:transition-none"
        style={{ padding: board ? "18px 20px 20px" : "20px 22px 22px" }}
      >
        <span className="flex items-start justify-between gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">{club.tag}</span>
          <span className="tnum font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
            {String(index + 1).padStart(2, "0")} / 04
          </span>
        </span>

        <span className={`mt-2 block font-serif leading-[0.9] text-ink ${board ? "text-[1.9rem]" : "text-[2.3rem]"}`}>
          {club.name}
        </span>
        <span className={`scrawl mt-1.5 block text-ink ${board ? "text-[15px] leading-[1.15]" : "text-[18px] leading-[1.15]"}`}>
          {club.tagline}
        </span>

        <span className="mt-3 block border-t border-ink/15 pt-2">
          <span className="block font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-2">{club.cadence}</span>
          <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-3">
            {club.nextEvent ? `next · ${club.nextEvent.when}` : "no date pinned"}
          </span>
        </span>

        <span className="mt-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            {club.status === "active" ? "running now" : "chartering"}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3 underline decoration-ink/25 underline-offset-[3px]">
            unpin →
          </span>
        </span>
      </span>
    </button>
  );
}

/* --------------------------------------------------------------- component */

export function Hallway({ clubs }: { clubs: HallwayClub[] }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [view, setView] = useState<"pending" | "corridor" | "still">("pending");

  const current = open === null ? null : clubs[open];

  /* The corridor is desktop-only. Below 768 the module is never imported, so the
     3D chunk is not fetched at all — no scene, no scroll track, no weight. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setView(mq.matches ? "corridor" : "still");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const openFlyer = useCallback((index: number) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpen(index);
  }, []);
  const closeFlyer = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((v) => (v === null ? v : (v + delta + clubs.length) % clubs.length)),
    [clubs.length],
  );

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("club");
    if (!wanted) return;
    const index = clubs.findIndex((club) => club.slug === wanted);
    if (index < 0) return;
    const frame = window.requestAnimationFrame(() => openFlyer(index));
    return () => window.cancelAnimationFrame(frame);
  }, [clubs, openFlyer]);

  /* dialog: scroll lock, focus in, focus back, key map, tab loop */
  useEffect(() => {
    if (open === null) return;
    const body = document.body;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      body.style.overflow = previous;
      window.cancelAnimationFrame(frame);
      lastFocus.current?.focus({ preventScroll: true });
    };
  }, [open === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDialogKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFlyer();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeFlyer, step],
  );

  return (
    <>
      {view === "corridor" ? <Corridor clubs={clubs} onOpen={openFlyer} /> : view === "still" ? <HallwayStill clubs={clubs} /> : <StageShell />}

      {/* ------------------------------------------------ the board (server-rendered) */}
      <section id="board" className="scroll-mt-20 bg-paper px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label">The board · Pier 2, Fort Mason</p>
              <h1 className="mt-3 font-serif text-[2.9rem] leading-[0.86] sm:text-[4.2rem]">
                Four clubs,
                <br />
                four sheets of paper.
              </h1>
            </div>
            <p className="max-w-[40ch] text-[14.5px] leading-relaxed text-ink-2">
              Pinned to the right-hand wall, past the lockers. Pull one off to read it close up —
              cadence, where it meets, the next date, who runs it — then go through to the club
              page.
            </p>
          </div>

          <div
            className="relative mt-8 p-3 shadow-[0_50px_90px_-50px_rgba(36,26,21,0.75)] sm:p-4"
            style={{ background: "linear-gradient(160deg, #7a5836, #5c4026 58%, #6b4b2e)" }}
          >
            <div className="tex-cork relative overflow-hidden px-4 py-10 shadow-[inset_0_2px_30px_rgba(52,34,18,0.45)] sm:px-8 sm:py-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,246,224,0.22),transparent_60%)]" />
              <div className="relative grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:gap-x-14">
                {clubs.map((club, index) => (
                  <div key={club.slug} className={`relative ${index % 2 ? "sm:translate-y-6" : ""}`}>
                    <Flyer club={club} index={index} variant="board" onOpen={() => openFlyer(index)} />
                  </div>
                ))}
              </div>

              <div className="relative mt-12 flex flex-wrap items-center justify-between gap-3">
                <Link href="/clubs/apply" className="pill-btn inline-flex min-h-[40px] items-center px-5">
                  Start a fifth club
                </Link>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link
                    href="/clubs/roster"
                    className="inline-flex min-h-[40px] items-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
                  >
                    All four on one page →
                  </Link>
                  <Link
                    href="/clubs/overview"
                    className="inline-flex min-h-[40px] items-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
                  >
                    See everything at a glance →
                  </Link>
                  <Link
                    href="/clubs/wall"
                    className="inline-flex min-h-[40px] items-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 underline decoration-ink/25 underline-offset-4 hover:text-ink"
                  >
                    The wall →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ the reading sheet */}
      {current ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/65 px-4 py-6 sm:px-6 sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hallway-sheet-title"
          onKeyDown={onDialogKey}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeFlyer();
          }}
        >
          <div ref={dialogRef} className="mx-auto flex min-h-full w-full max-w-[620px] items-center">
            <div className="relative w-full">
              <span className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                <Pin />
              </span>
              <div className="torn-soft bg-paper px-5 pb-6 pt-7 shadow-[var(--shadow-lift)] sm:px-9 sm:pb-8 sm:pt-9">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="label">unpinned · {current.tag}</span>
                    <p className="tnum mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                      {String((open ?? 0) + 1).padStart(2, "0")} / {String(clubs.length).padStart(2, "0")}
                      <span className="ml-2 text-ink-soft">{current.status === "active" ? "running now" : "chartering"}</span>
                    </p>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={closeFlyer}
                    className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-ink/25 px-4 text-[12px] font-medium tracking-[-0.02em] text-ink transition-colors hover:bg-ink/8"
                  >
                    Pin it back
                    <span aria-hidden className="font-mono text-[11px]">
                      ✕
                    </span>
                  </button>
                </div>

                <h2 id="hallway-sheet-title" className="mt-5 font-serif text-[2.9rem] leading-[0.86] sm:text-[3.6rem]">
                  {current.name}
                </h2>
                <p className="scrawl mt-2 text-[1.35rem] leading-tight">{current.tagline}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-ink">{current.description}</p>

                <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-ink/15 pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="label">Cadence</dt>
                    <dd className="mt-1 text-[14px] leading-snug text-ink">{current.cadence}</dd>
                  </div>
                  <div>
                    <dt className="label">Where</dt>
                    <dd className="mt-1 text-[14px] leading-snug text-ink">{current.location}</dd>
                  </div>
                  <div>
                    <dt className="label">Next on the board</dt>
                    <dd className="mt-1 text-[14px] leading-snug text-ink">
                      {current.nextEvent ? (
                        <>
                          {current.nextEvent.when} · {current.nextEvent.title}
                        </>
                      ) : (
                        <span className="text-ink-2">No date pinned yet</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Lead</dt>
                    <dd className="mt-1 text-[14px] leading-snug text-ink">
                      {current.lead ? (
                        <>
                          {current.lead.name}
                          <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                            {current.lead.role}
                          </span>
                        </>
                      ) : (
                        <span className="text-ink-2">Not named yet</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href={`/clubs/${current.slug}`} className="pill-btn">
                    Read the whole club →
                  </Link>
                  {current.nextEvent ? (
                    <a href={current.nextEvent.href} target="_blank" rel="noreferrer" className="pill-btn-secondary">
                      RSVP ↗
                    </a>
                  ) : null}
                </div>

                <div className="mt-7 flex items-center justify-between gap-3 border-t border-ink/15 pt-4">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
                  >
                    ← previous sheet
                  </button>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">arrow keys flip</span>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
                  >
                    next sheet →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
