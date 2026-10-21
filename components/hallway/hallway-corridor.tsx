"use client";

/**
 * The corridor — the 3D half of `/clubs`, split out so it can be lazily imported.
 *
 * It is only ever mounted at ≥768px (see `hallway.tsx`): the spec forbids the 3D
 * path on phones, so the module is never fetched at 390 and the static hero there
 * costs nothing. Nothing else imports this file, so the chunk lands on `/clubs` only.
 *
 * Geometry note (this is the bug the audit found): the camera is a `preserve-3d`
 * parent of every plane, so translating it to *negative* z pushes the world away.
 * The eye travels toward the board on **positive** z. The board sits at z = −2400,
 * so the settle puts the eye at +2242 — 160 units of depth — and a small plane
 * zoom lands it filling the 1440 frame.
 *
 * Only `transform` and `opacity` are written, once per animation frame, from a
 * passive scroll listener.
 */

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { HallwayClub } from "./types";

/* ------------------------------------------------------------------ geometry */

const HALL_HALF = 520; // walls at x = ±520
const FLOOR_Y = 330; // floor 330 below the eye
const CEIL_Y = -300;
const HALL_LEN = 7600;
const BOARD_Z = -2400; // the pinboard on the end wall, offset right of centre
const BOARD_X = 150;
const BOARD_W = 980;
const BOARD_H = 600;

/* The eye walks *toward* the board: +z. Depth to the board = |BOARD_Z| − z.
   p 0.00 → 2400 deep (board 267 px wide), p 0.60 → 350 deep (≈706 px),
   p 0.68 overshoot → 185 deep and drifting off its centre line (≈813 px, half
   out of frame), settle → 160 deep, square-on, ≈832 px × the zoom below. */
const WALK_END_Z = 2050;
const OVERSHOOT_Z = 2215;
const SETTLE_Z = 2242;
const SETTLE_X = -150; // camera x composes with the board's own x = 150, so −150 puts it dead centre
const SETTLE_ZOOM = 1.72; // 832 px → ≈1431 px, i.e. the board is the frame

type PlaneProps = {
  w: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  scale?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** A rectangle in world space. Eye at the origin, looking down −z. */
function Plane({ w, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, scale = 1, className = "", style, children }: PlaneProps) {
  return (
    <div
      aria-hidden
      className={`absolute left-1/2 top-1/2 ${className}`}
      style={{
        width: w,
        height: h,
        transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale}, ${scale}, 1)`,
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

/* WP2 pins the mapping: walk 0 → 0.60, overshoot + turn-back 0.60 → 0.85,
   settle 0.85 → 1.0. The overshoot sits inside beat 2 (0.60 → 0.68) so the
   double take survives without moving the pinned beat boundaries. */
const WALK_END = 0.6;
const TURN_START = 0.68;
const TURN_END = 0.85;

type Camera = { x: number; y: number; z: number; yaw: number; roll: number; zoom: number };

/** Scroll progress → eye position, head angle and board zoom. Pure, so it is testable. */
export function cameraAt(p: number): Camera {
  const t = clamp(p);

  if (t <= WALK_END) {
    // Walk: the eye travels the corridor toward the board, feet doing the bob.
    const k = easeInOut(t / WALK_END);
    return {
      x: 0,
      y: Math.sin(k * Math.PI * 11) * 7 * (1 - k * 0.35),
      z: WALK_END_Z * k,
      yaw: Math.sin(k * Math.PI * 5.5) * 1.6,
      roll: Math.sin(k * Math.PI * 2.75) * 0.7,
      zoom: 1,
    };
  }

  if (t <= TURN_START) {
    // Overshoot: two more steps, drifting off the board's centre line so it slides
    // out to the right of the frame — you have walked past it.
    const k = (t - WALK_END) / (TURN_START - WALK_END);
    return {
      x: -520 * k,
      y: 0,
      z: WALK_END_Z + (OVERSHOOT_Z - WALK_END_Z) * k,
      yaw: -4.5 * k,
      roll: -0.4 * k,
      zoom: 1,
    };
  }

  if (t <= TURN_END) {
    // The double take: swing back onto the board, a beat past square, then settle.
    // The board comes up to fill the frame through the same move.
    const k = (t - TURN_START) / (TURN_END - TURN_START);
    const turn = easeOut(k);
    const over = Math.sin(Math.PI * k) * 2.6 * (1 - k);
    return {
      x: -520 + (SETTLE_X + 520) * turn,
      y: 0,
      z: OVERSHOOT_Z + (SETTLE_Z - OVERSHOOT_Z) * turn,
      yaw: -4.5 * (1 - turn) + over,
      roll: -0.5 * Math.sin(Math.PI * k),
      zoom: 1 + (SETTLE_ZOOM - 1) * turn,
    };
  }

  // Settled on the board, square-on, with the last of the sway dying out.
  const s = (t - TURN_END) / (1 - TURN_END);
  return {
    x: SETTLE_X,
    y: 0,
    z: SETTLE_Z + 6 * s,
    yaw: Math.exp(-s * 4.2) * 1.6 * Math.sin(s * 13),
    roll: Math.exp(-s * 4.2) * 0.35 * Math.sin(s * 13),
    zoom: SETTLE_ZOOM,
  };
}

/* ------------------------------------------------------------------- the board */

const TILT = [-2.6, 3.1, 1.9, -3.4];

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

export default function HallwayCorridor({ clubs }: { clubs: HallwayClub[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);

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
      const board = track.querySelector<HTMLElement>(".hallway-board");
      if (board) board.style.transform = `translate(-50%, -50%) translate3d(${BOARD_X}px, 10px, ${BOARD_Z}px) scale3d(${c.zoom.toFixed(4)}, ${c.zoom.toFixed(4)}, 1)`;
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

  return (
    <div
      ref={trackRef}
      id="hallway-track"
      className="relative h-[calc(190dvh-4rem)] motion-reduce:hidden"
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
            <Plane w={2800} h={HALL_LEN} y={FLOOR_Y} z={-HALL_LEN / 2 + 700} rx={90} style={{ overflow: "hidden" }}>
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
            <Plane w={2800} h={HALL_LEN} y={CEIL_Y} z={-HALL_LEN / 2 + 700} rx={-90} style={{ overflow: "hidden" }}>
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
              <Plane key={z} w={260} h={470} x={-HALL_HALF + 6} y={FLOOR_Y - 235} z={z} ry={90} className="hallway-door">
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
            <Plane w={2400} h={FLOOR_Y - CEIL_Y} y={(FLOOR_Y + CEIL_Y) / 2} z={-HALL_LEN + 300} className="hallway-exit">
              <span className="absolute inset-0 bg-[linear-gradient(#cdbb9f,#b9a586)]" />
              <span className="absolute left-1/2 top-[34%] h-[52%] w-[22%] -translate-x-1/2 bg-[linear-gradient(#7a5c40,#63482f)] shadow-[inset_0_0_0_5px_rgba(48,34,22,0.4)]" />
              <span className="absolute left-1/2 top-[20%] h-6 w-24 -translate-x-1/2 bg-[#1f6b4a] text-center font-mono text-[11px] leading-6 tracking-[0.2em] text-[#eaf5ee]">
                EXIT
              </span>
            </Plane>

            {/* ---------------- the pinboard, on the end wall ---------------- */}
            <Plane
              w={BOARD_W}
              h={BOARD_H}
              x={BOARD_X}
              y={10}
              z={BOARD_Z}
              className="hallway-board"
              style={{ transformOrigin: "50% 50%", willChange: "transform" }}
            >
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
          style={{ opacity: "max(0, min(1, calc((0.45 - var(--p, 0)) * 6)))" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">keep scrolling — walk up to the board</p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center"
          style={{ opacity: "max(0, min(1, min(calc((var(--p, 0) - 0.68) * 6), calc((0.83 - var(--p, 0)) * 7))))" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">wait — back up a step</p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center"
          style={{ opacity: "max(0, min(1, calc((var(--p, 0) - 0.83) * 6)))" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">the board · unpin a flyer below ↓</p>
        </div>
      </div>
    </div>
  );
}
