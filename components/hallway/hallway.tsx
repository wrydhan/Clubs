"use client";

/**
 * The hallway — the Clubs entrance at `/clubs`.
 *
 * One continuous camera in three beats, all real 3D geometry in CSS (no library,
 * so nothing to lazy-load and no bundle cost on the other routes):
 *
 *   walk      scroll dollies the eye down a corridor at walking pace, with a
 *             head-bob and sway so it reads as feet, not a dolly. Floor, ceiling,
 *             doors, lockers and the window run are actual planes in a common
 *             perspective space, so the vanishing point converges for real.
 *   double    the eye overshoots the pinboard by a step, then pivots back to face
 *   take      it square-on (with a small lean-in), which is the moment Waleed asked
 *             for: you walk past, notice, turn back.
 *   board     the pinned flyers unpin into a legible sheet, with the funnel through
 *             to the club page. The board itself is server-rendered markup below the
 *             walk: the corridor never hides content from a crawler, a slow phone or
 *             `prefers-reduced-motion`.
 *
 * Only `transform` and `opacity` are written, once per animation frame, from a
 * passive scroll listener.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pin } from "@/components/collage/paper";

export type HallwayClub = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cadence: string;
  location: string;
  tag: string;
  status: "active" | "coming-soon";
  lead?: { name: string; role: string };
  nextEvent?: { title: string; when: string; href: string };
};

/* ------------------------------------------------------------------ geometry */

const HALL_HALF = 520; // walls at x = ±520
const FLOOR_Y = 330; // floor 330 below the eye
const CEIL_Y = -300;
const HALL_LEN = 7600;
const BOARD_Z = -2500; // the pinboard's centre, on the right wall
const WALK_END_Z = -2350; // where the walk stops, board just ahead on the right
const OVERSHOOT_Z = -2720; // the step past it
const SETTLE_Z = -2500; // camera comes back level with the board
const LEAN_IN_X = 96; // the lean toward the board at the end

type PlaneProps = {
  w: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** A rectangle in world space. Eye at the origin, looking down −z. */
function Plane({ w, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, className = "", style, children }: PlaneProps) {
  return (
    <div
      aria-hidden
      className={`absolute left-1/2 top-1/2 ${className}`}
      style={{
        width: w,
        height: h,
        transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Kraft / cork / paper grain, so the corridor is the same world as the board. */
function Grain({ src, size = 420, opacity = 0.3 }: { src: string; size?: number; opacity?: number }) {
  return (
    <span
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${size}px`,
        opacity,
        mixBlendMode: "multiply",
      }}
    />
  );
}

/* ------------------------------------------------------------------ the walk */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const WALK_END = 0.56;
const TURN_START = 0.68;
const TURN_END = 0.86;

type Camera = { x: number; y: number; z: number; yaw: number; roll: number };
const ORIGIN: Camera = { x: 0, y: 0, z: 0, yaw: 0, roll: 0 };

/** Scroll progress → eye position and head angle. Pure, so it is testable. */
export function cameraAt(p: number): Camera {
  const t = clamp(p);

  if (t <= WALK_END) {
    // Walk: the eye travels the corridor, feet doing the bob.
    const k = easeInOut(t / WALK_END);
    return {
      x: 0,
      y: Math.sin(k * Math.PI * 11) * 7 * (1 - k * 0.35),
      z: WALK_END_Z * k,
      yaw: Math.sin(k * Math.PI * 5.5) * 1.6,
      roll: Math.sin(k * Math.PI * 2.75) * 0.7,
    };
  }

  if (t <= TURN_START) {
    // Overshoot: two more steps past the board, head still forward.
    const k = (t - WALK_END) / (TURN_START - WALK_END);
    return { x: 0, y: 0, z: WALK_END_Z + (OVERSHOOT_Z - WALK_END_Z) * k, yaw: 0, roll: 0 };
  }

  if (t <= TURN_END) {
    // The double take: turn back onto the board, a beat past square, then settle.
    const k = (t - TURN_START) / (TURN_END - TURN_START);
    const turn = easeOut(k);
    const over = Math.sin(Math.PI * k) * 6 * (1 - k);
    return {
      x: LEAN_IN_X * turn,
      y: 0,
      z: OVERSHOOT_Z + (SETTLE_Z - OVERSHOOT_Z) * turn,
      yaw: 90 * turn + over,
      roll: -1.6 * Math.sin(Math.PI * k),
    };
  }

  // Settled on the board, with the last of the sway dying out.
  const s = (t - TURN_END) / (1 - TURN_END);
  return {
    x: LEAN_IN_X,
    y: 0,
    z: SETTLE_Z,
    yaw: 90 + Math.exp(-s * 4.2) * 2.4 * Math.sin(s * 13),
    roll: Math.exp(-s * 4.2) * 0.5 * Math.sin(s * 13),
  };
}

/* ------------------------------------------------------- the flyer + sheet */

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

        <span
          className={`mt-2 block font-serif leading-[0.9] text-ink ${board ? "text-[1.9rem]" : "text-[2.3rem]"}`}
        >
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

/** The pinboard face used in the corridor: real flyers, small, non-interactive
    (the same four are the interactive board below the walk). */
function CorridorBoard({ clubs }: { clubs: HallwayClub[] }) {
  return (
    <div className="h-full w-full p-[12px]" style={{ background: "linear-gradient(160deg, #7a5836, #5c4026 58%, #6b4b2e)" }}>
      <div className="tex-cork relative h-full w-full overflow-hidden shadow-[inset_0_2px_26px_rgba(52,34,18,0.5)]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,246,224,0.26),transparent_62%)]" />

        <div className="absolute inset-x-0 top-[4%] flex items-start justify-between px-[3%]">
          <span className="bg-paper px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-ink-2 shadow-[var(--shadow-scrap)]">
            founders, inc. · pier 2
          </span>
          <span className="rotate-[-2deg] bg-paper/90 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-ink-soft shadow-[var(--shadow-scrap)]">
            the four clubs
          </span>
        </div>

        <div className="absolute inset-x-[3%] bottom-[5%] top-[14%] grid grid-cols-2 grid-rows-2 gap-x-[4%] gap-y-[4%]">
          {clubs.map((club, index) => (
            <div
              key={club.slug}
              className={`relative bg-paper px-2 py-1.5 shadow-[0_6px_14px_-8px_rgba(36,26,21,0.7)] ${
                index % 2 ? "translate-y-[6%]" : ""
              }`}
              style={{ transform: `rotate(${TILT[index % TILT.length]}deg)` }}
            >
              <span className="block font-mono text-[6px] uppercase tracking-[0.16em] text-ink-3">{club.tag}</span>
              <span className="mt-0.5 block font-serif text-[13px] leading-[0.95] text-ink">{club.name}</span>
              <span className="mt-1 block font-mono text-[5.5px] uppercase leading-[1.35] tracking-[0.1em] text-ink-2">
                {club.cadence}
              </span>
              <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b98a3f] shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- component */

export function Hallway({ clubs }: { clubs: HallwayClub[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const current = open === null ? null : clubs[open];

  /* ---- the walk: one passive scroll listener, one transform write a frame ---- */
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const camera = cameraRef.current;
    if (!track || !stage || !camera) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const paint = () => {
      frame = 0;
      const span = track.offsetHeight - stage.offsetHeight;
      const p = span <= 0 ? 1 : clamp(-track.getBoundingClientRect().top / span);
      const c = mq.matches ? cameraAt(1) : cameraAt(p);
      camera.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, ${c.z.toFixed(2)}px) rotateY(${c.yaw.toFixed(3)}deg) rotateZ(${c.roll.toFixed(3)}deg)`;
      stage.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    mq.addEventListener("change", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      mq.removeEventListener("change", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
      {/* ------------------------------------------------ the corridor */}
      <div
        ref={trackRef}
        id="hallway-track"
        className="relative h-[300dvh] motion-reduce:hidden md:h-[360dvh]"
        style={{ "--p": 0 } as CSSProperties}
      >
        <div
          ref={stageRef}
          id="hallway-stage"
          className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden bg-[#e6dbc9]"
          style={{ "--p": 0 } as CSSProperties}
        >
          <p className="sr-only">
            A first-person walk down the Pier 2 hallway to the club pinboard. Scroll to walk, or use
            “Skip to the board” to jump straight to the four flyers.
          </p>

          {/* the 3D stage: perspective parent → camera → world */}
          <div className="absolute inset-0" style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}>
            <div
              ref={cameraRef}
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform",
                transform: "translate3d(0px, 0px, 0px)",
              }}
            >
              {/* floor */}
              <Plane w={1400} h={HALL_LEN} y={FLOOR_Y} z={-HALL_LEN / 2 + 200} rx={90} style={{ overflow: "hidden" }}>
                <span
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "#ddccae",
                    backgroundImage:
                      "repeating-linear-gradient(to right, rgba(64,46,30,0.20) 0 2px, transparent 2px 190px), repeating-linear-gradient(to bottom, rgba(64,46,30,0.16) 0 2px, transparent 2px 190px), linear-gradient(#e8dcc6, #cfbc9c)",
                  }}
                />
                <Grain src="/collage/paper-kraft.webp" size={460} opacity={0.34} />
              </Plane>

              {/* ceiling */}
              <Plane w={1400} h={HALL_LEN} y={CEIL_Y} z={-HALL_LEN / 2 + 200} rx={-90} style={{ overflow: "hidden" }}>
                <span
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "#f0e7d8",
                    backgroundImage:
                      "repeating-linear-gradient(to right, rgba(72,52,33,0.14) 0 2px, transparent 2px 260px), repeating-linear-gradient(to bottom, rgba(72,52,33,0.10) 0 2px, transparent 2px 260px), linear-gradient(#f4edde, #e2d6c0)",
                  }}
                />
              </Plane>

              {/* left wall: windows + a doorway */}
              <Plane
                w={HALL_LEN}
                h={FLOOR_Y - CEIL_Y}
                x={-HALL_HALF}
                y={(FLOOR_Y + CEIL_Y) / 2}
                z={-HALL_LEN / 2 + 200}
                ry={90}
                style={{ overflow: "hidden" }}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "#d8c6a9",
                    backgroundImage:
                      "linear-gradient(to top, #b39a78 0 14%, #cbb69a 14% 30%, #dccbae 30% 100%)",
                  }}
                />
                {/* the window run: warm light every few metres */}
                <span
                  className="absolute inset-x-0"
                  style={{
                    top: "18%",
                    height: "46%",
                    backgroundImage:
                      "repeating-linear-gradient(to right, rgba(255,252,240,0.95) 0 190px, rgba(255,252,240,0.95) 190px, transparent 190px 250px), repeating-linear-gradient(to right, transparent 0 190px, rgba(72,52,33,0.45) 190px 196px, transparent 196px 250px)",
                    boxShadow: "0 0 60px 12px rgba(255,246,214,0.45)",
                  }}
                />
                <Grain src="/collage/paper-newsprint.webp" size={380} opacity={0.22} />
              </Plane>

              {/* left wall doors */}
              {[-520, -1420, -2320, -3220, -4120].map((z) => (
                <Plane key={z} w={260} h={470} x={-HALL_HALF + 6} y={FLOOR_Y - 235} z={z} ry={90}>
                  <span className="absolute inset-0 bg-[linear-gradient(to_bottom,#7e6146,#96765a)] shadow-[inset_0_0_0_6px_rgba(58,42,28,0.35)]" />
                  <span className="absolute right-[12%] top-1/2 h-2 w-2 rounded-full bg-[#c9a87c]" />
                  <span className="absolute inset-x-[18%] top-[8%] h-[26%] bg-[rgba(255,248,230,0.18)]" />
                </Plane>
              ))}

              {/* right wall: lockers, then the pinboard */}
              <Plane
                w={HALL_LEN}
                h={FLOOR_Y - CEIL_Y}
                x={HALL_HALF}
                y={(FLOOR_Y + CEIL_Y) / 2}
                z={-HALL_LEN / 2 + 200}
                ry={-90}
                style={{ overflow: "hidden" }}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "#d9c8ac",
                    backgroundImage: "linear-gradient(to top, #b39a78 0 14%, #d3c0a3 14% 30%, #ddceb2 30% 100%)",
                  }}
                />
                {/* locker bank */}
                <span
                  className="absolute inset-x-0"
                  style={{
                    top: "24%",
                    height: "52%",
                    backgroundColor: "rgba(112,132,120,0.32)",
                    backgroundImage:
                      "repeating-linear-gradient(to right, rgba(255,250,236,0.55) 0 1px, rgba(52,58,52,0.30) 1px 3px, transparent 3px 118px), repeating-linear-gradient(to bottom, transparent 0 190px, rgba(52,58,52,0.22) 190px 192px, transparent 192px 400px)",
                  }}
                />
                <Grain src="/collage/paper-kraft.webp" size={420} opacity={0.28} />
              </Plane>

              {/* ceiling lights */}
              {[-380, -1180, -1980, -2780, -3580, -4380].map((z) => (
                <Plane key={z} w={210} h={44} y={CEIL_Y + 6} z={z} rx={90}>
                  <span className="absolute inset-0 bg-[#fffdf4] shadow-[0_0_70px_26px_rgba(255,246,214,0.75)]" />
                </Plane>
              ))}

              {/* the end of the hall: a fire door, so it is a corridor and not a void */}
              <Plane w={1400} h={FLOOR_Y - CEIL_Y} y={(FLOOR_Y + CEIL_Y) / 2} z={-HALL_LEN + 140}>
                <span className="absolute inset-0 bg-[linear-gradient(#cdbb9f,#b9a586)]" />
                <span className="absolute left-1/2 top-[34%] h-[52%] w-[22%] -translate-x-1/2 bg-[linear-gradient(#7a5c40,#63482f)] shadow-[inset_0_0_0_5px_rgba(48,34,22,0.4)]" />
                <span className="absolute left-1/2 top-[20%] h-6 w-24 -translate-x-1/2 bg-[#1f6b4a] text-center font-mono text-[11px] leading-6 tracking-[0.2em] text-[#eaf5ee]">
                  EXIT
                </span>
              </Plane>

              {/* ---------------- the pinboard, right hand wall ---------------- */}
              <Plane w={900} h={540} x={HALL_HALF - 10} y={20} z={BOARD_Z} ry={-90}>
                <div className="h-full w-full shadow-[0_40px_80px_-30px_rgba(36,26,21,0.8)]">
                  <CorridorBoard clubs={clubs} />
                </div>
              </Plane>
            </div>
          </div>

          {/* light and haze, so depth reads: warmer near the windows, softer far off */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(85% 70% at 16% 42%, rgba(255,248,228,0.55), transparent 62%), radial-gradient(120% 100% at 50% 55%, transparent 38%, rgba(36,26,21,0.32) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: "max(0, min(1, calc((0.9 - var(--p, 0)) * 1.6)))",
              background: "linear-gradient(to bottom, rgba(36,26,21,0.16), transparent 26%, transparent 74%, rgba(36,26,21,0.2))",
            }}
          />

          {/* stage furniture: skip control is first in the tab order here */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 pt-4 sm:px-7 sm:pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">second floor · hallway east</p>
            <a
              href="#board"
              className="pill-btn-secondary pointer-events-auto inline-flex min-h-[40px] shrink-0 items-center px-4 text-[11px]"
            >
              Skip to the board ↓
            </a>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center"
            style={{ opacity: "max(0, min(1, calc(1 - var(--p, 0) * 3)))" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">keep scrolling — walk up to the board</p>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center"
            style={{ opacity: "max(0, min(1, calc((var(--p, 0) - 0.66) * 5)))" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">wait — back up a step</p>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center"
            style={{ opacity: "max(0, min(1, calc((var(--p, 0) - 0.84) * 6)))" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">the board · unpin a flyer below ↓</p>
          </div>
        </div>
      </div>

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
              Pinned at the end of the hallway. Pull one off to read it close up — cadence, where it
              meets, the next date, who runs it — then go through to the club page.
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
