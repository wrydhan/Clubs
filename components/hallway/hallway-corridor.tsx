"use client";

/**
 * The corridor — the 3D half of `/clubs`, split out so it can be lazily imported.
 *
 * It is only ever mounted at ≥768px (see `hallway.tsx`): the spec forbids the 3D
 * path on phones, so the module is never fetched at 390 and the static hero there
 * costs nothing.
 *
 * Two rules shape everything here:
 *
 * 1. THE ROOM IS CLOSED. Floor, ceiling, both walls, the end wall and a return
 *    behind the eye all sit edge to edge at the same corridor width, with skirtings,
 *    coving and contact shadows on the joins. The camera can never see around a
 *    plane into empty space.
 * 2. THE WALK IS NOT PAGE SCROLL. One wheel notch is a fixed eighth of the walk
 *    (see `STEP`), applied to a target and followed with an exponential damp, so a
 *    mouse wheel, a trackpad and a swipe all advance the same distance and nothing
 *    feels steppy. At the board the walk locks for good: it cannot be rewound, and
 *    the page scrolls on to the board section below.
 *
 * Geometry convention: the camera is a `preserve-3d` parent of every plane and
 * `pose()` turns an eye position plus a yaw into that parent's transform, so the
 * walk is described in plain world coordinates (eye z, eye x, degrees of head
 * turn) instead of in CSS translation arithmetic.
 *
 * The board hangs on the RIGHT wall, in the clear run between two locker banks:
 * you walk down the hall toward it, the head starts to turn over the last fifth
 * of the walk, and the settle squares the eye up on it 360 units out. The board
 * is sized like a real pinboard against the 500-unit door (420 × 300), and the
 * close settle is what keeps it ≥1000 px wide on a 1440 frame, so the flyers stay
 * legible without the board being giant (see `fitScale`).
 *
 * The corridor does NOT stop at the board: it carries on past it with more locker
 * banks and classroom doors and finishes at a stair door in the end wall, with a
 * landing and a descending flight behind it — depth you never reach.
 *
 * The lockers are boxes, not pictures of lockers: a front face standing 72 units
 * off the wall, a top, a side return and a cast shadow, and they run full height
 * (420) against the 500 door, above the eye line, so the walker no longer feels
 * like a giant.
 *
 * Only `transform` and `opacity` are written, once per animation frame.
 */

import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Pin } from "@/components/collage/paper";
import type { HallwayClub } from "./types";

/* ------------------------------------------------------------------ geometry */

const HALL_HALF = 520; // walls at x = ±520
const FLOOR_Y = 372; // floor 372 below the eye — 1.56 m, a real standing height
const CEIL_Y = -280; // ceiling 280 above it — 2.74 m of room
const HALL_W = HALL_HALF * 2;
const HALL_H = FLOOR_Y - CEIL_Y;

const NEAR_Z = 150; // wall a little behind the eye — far enough to close the hall,
                    // near enough that no plane crosses the camera plane
const FAR_Z = -3400; // the end wall — nine metres past the board, so the hall reads deep
const HALL_LEN = NEAR_Z - FAR_Z;
const MID_Z = (NEAR_Z + FAR_Z) / 2;

/* The pinboard, on the right-hand wall beside the lockers, at realistic scale:
   420 × 300 world units against a 500-unit door (a pinboard is a little over a
   door-width wide and about shoulder-to-head tall), hanging from 0.78 m to 2.04 m
   above the floor. The close settle (360 units out, see `EYE_TURN_X`) then lands
   it at 1050 × 750 px on a 1440 × 900 frame — ≥1000 px wide, so the flyers stay
   legible, with nothing cropped. */
const BOARD_W = 420;
const BOARD_H = 300;
const BOARD_X = HALL_HALF - 3; // a hair inside the wall, so it never z-fights
const BOARD_Z = -1000; // where along the wall it hangs
const BOARD_Y = 12; // centre 1.50 m up: the board hangs 0.88 → 2.14 m

/* Camera. CSS perspective puts the eye 900 px in front of the projection plane, so
   a surface D away renders at scale 900/D. The eye walks the centre line from
   `EYE_START_Z` to `EYE_APPROACH_Z`, then turns right and steps in to
   `EYE_TURN_X`, ending square-on to the board and abreast of it. */
const PERSPECTIVE = 900;
const EYE_START_Z = 900;
const EYE_APPROACH_Z = -760; // the walk stops 240 short of the board…
const EYE_TURN_X = HALL_HALF - 360; // …then steps to 160 and turns to face it
const EYE_DIST = HALL_HALF - EYE_TURN_X; // 360 units from eye to board at rest

/* The flyer art is laid out at the size it is DISPLAYED, then scaled back down
   into the 420 × 300 plane. The settled camera projects the plane at
   PERSPECTIVE / EYE_DIST = 2.5×, so authoring the art at 420 and letting the
   projection magnify it means every glyph is rasterised at 1× layout size and
   stretched — the 4.5 px captions and the metadata rows are the first to go soft.
   `BOARD_RASTER` is that projection scale: the art canvas is BOARD_W ×
   BOARD_RASTER wide and a single inverse `scale()` fits it back into the plane,
   so the layer is rasterised once, at its displayed size. `ART` is one design
   unit, so the composition still scales with `BOARD_W`. */
const BOARD_RASTER = PERSPECTIVE / EYE_DIST;
const ART = (BOARD_W * BOARD_RASTER) / 840;
const u = (v: number) => `${+(v * ART).toFixed(2)}px`;
const YAW_NOTICE = 7; // degrees of head-turn picked up at the end of the walk
const EYE_TURN_YAW = 90; // square on to the right-hand wall
const WALK_END = 0.64;

/* One wheel notch = one eighth of the walk. `WHEEL_UNIT` is the deltaY a mouse
   wheel reports for a single notch on the platforms that use 100; trackpads report
   many small deltas that add up to the same distance. */
const STEP = 0.125;
const WHEEL_UNIT = 100;
const GAIN = STEP / WHEEL_UNIT;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** Smoothstep: eases in AND out, which is what a head turn should do. */
const smooth = (t: number) => {
  const k = clamp(t);
  return k * k * (3 - 2 * k);
};

type Camera = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number };
type Eye = { x: number; y: number; z: number };

/**
 * Eye position + head yaw → the camera element's transform.
 *
 * The camera is the 3D parent of the world, so it has to be placed by the inverse
 * of its own rotation: to stand at `eye` and look `yaw` degrees to the right, the
 * transform is `translate3d(-R·eye) rotateY(yaw)` about the projection point.
 * With a zero yaw this is the plain `translate3d(-x, -y, 900 - z)` a walk down the
 * hall needs; a ninety-degree yaw swaps the two axes, which is what the double
 * take at the end of the walk is built on.
 */
function pose(eye: Eye, yawDeg: number, pitch = 0, roll = 0): Camera {
  const r = (yawDeg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return {
    x: -(eye.x * cos + eye.z * sin),
    y: -eye.y,
    z: PERSPECTIVE + eye.x * sin - eye.z * cos,
    yaw: yawDeg,
    pitch,
    roll,
  };
}

/** Progress → eye position, head angle and roll. Pure, so it is testable. */
export function cameraAt(p: number): Camera {
  const t = clamp(p);

  if (t <= WALK_END) {
    const k = t / WALK_END;
    // A walking bob and a faint sway, both dying out as the walk ends, and the
    // first few degrees of the head turn over the last fifth — the double take.
    return pose(
      {
        x: 0,
        y: Math.sin(k * Math.PI * 8) * 6 * (1 - k * 0.55),
        z: EYE_START_Z + (EYE_APPROACH_Z - EYE_START_Z) * k,
      },
      Math.sin(k * Math.PI * 4) * 0.9 * (1 - k * 0.4) + smooth((k - 0.8) / 0.2) * YAW_NOTICE,
      0,
      Math.sin(k * Math.PI * 2) * 0.35,
    );
  }

  const s = smooth((t - WALK_END) / (1 - WALK_END));
  return pose(
    {
      x: EYE_TURN_X * s,
      y: 0,
      z: EYE_APPROACH_Z + (BOARD_Z - EYE_APPROACH_Z) * s,
    },
    YAW_NOTICE + (EYE_TURN_YAW - YAW_NOTICE) * s,
  );
}

/** How much the whole projection has to shrink for the settled board to fit. */
function fitScale(width: number, height: number) {
  const px = (BOARD_W * PERSPECTIVE) / EYE_DIST;
  const py = (BOARD_H * PERSPECTIVE) / EYE_DIST;
  return Math.min(1, (width - 56) / px, (height - 56) / py);
}

/* ------------------------------------------------------------------ primitives */

type PlaneProps = {
  innerRef?: React.Ref<HTMLDivElement>;
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
function Plane({ innerRef, w, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, className = "", style, children }: PlaneProps) {
  return (
    <div
      ref={innerRef}
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

/** Down a corridor, in world z. */
const run = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let z = from; z >= to; z -= step) out.push(z);
  return out;
};

/* ---------------------------------------------------------------- the room */

function Floor() {
  return (
    <Plane w={HALL_W} h={HALL_LEN} y={FLOOR_Y} z={MID_Z} rx={90} style={{ overflow: "hidden" }}>
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: "#d9c8a8",
          backgroundImage: [
            // tile joints across the width, then down the length
            "repeating-linear-gradient(to right, rgba(58,42,28,0.24) 0 2px, transparent 2px 130px)",
            "repeating-linear-gradient(to bottom, rgba(58,42,28,0.18) 0 2px, transparent 2px 170px)",
            "linear-gradient(#e7d9be, #cdb998)",
          ].join(","),
        }}
      />
      {/* faint scuffs and the light falling from each ceiling strip */}
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,248,224,0.26) 0 96px, transparent 96px 380px)",
        }}
      />
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(180px 120px at 24% 30%, rgba(64,48,32,0.10), transparent 70%), radial-gradient(220px 90px at 78% 62%, rgba(64,48,32,0.09), transparent 70%)",
        }}
      />
      <Grain src="/collage/paper-kraft.webp" size={520} opacity={0.3} />
      {/* contact shadow where the floor meets each wall */}
      <span
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 170px 0 120px -80px rgba(38,26,16,0.55), inset -170px 0 120px -80px rgba(38,26,16,0.55), inset 0 120px 120px -90px rgba(38,26,16,0.35)",
        }}
      />
    </Plane>
  );
}

function Ceiling() {
  return (
    <Plane w={HALL_W} h={HALL_LEN} y={CEIL_Y} z={MID_Z} rx={-90} style={{ overflow: "hidden" }}>
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: "#f1e9db",
          backgroundImage: [
            "repeating-linear-gradient(to right, rgba(72,52,33,0.16) 0 2px, transparent 2px 260px)",
            "repeating-linear-gradient(to bottom, rgba(72,52,33,0.12) 0 2px, transparent 2px 300px)",
            "linear-gradient(#f6efe2, #e2d6c0)",
          ].join(","),
        }}
      />
      <Grain src="/collage/paper-newsprint.webp" size={460} opacity={0.16} />
      <span
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 150px 0 110px -70px rgba(52,38,24,0.45), inset -150px 0 110px -70px rgba(52,38,24,0.45), inset 0 -110px 110px -80px rgba(52,38,24,0.28)",
        }}
      />
    </Plane>
  );
}

/** Recessed strip lights, in two planes each: a housing well and a lit lens. */
function CeilingLights() {
  return (
    <>
      {run(60, -3300, 340).map((z) => (
        <div key={z}>
          <Plane w={300} h={110} y={CEIL_Y + 2} z={z} rx={90}>
            <span
              className="absolute inset-0 rounded-[4px]"
              style={{ background: "linear-gradient(#c8b99e, #dccfb6)", boxShadow: "inset 0 0 0 2px rgba(70,52,34,0.35)" }}
            />
          </Plane>
          <Plane w={252} h={64} y={CEIL_Y + 5} z={z} rx={90}>
            <span
              className="absolute inset-0 rounded-[3px]"
              style={{
                background: "linear-gradient(#fffdf2, #f6edd6)",
                boxShadow: "0 0 44px 18px rgba(255,246,214,0.55), inset 0 0 18px rgba(255,255,240,0.9)",
              }}
            />
          </Plane>
        </div>
      ))}
    </>
  );
}

/** The left wall: an unbroken window run. No doors on this side any more. */
function WindowWall() {
  return (
    <Plane w={HALL_LEN} h={HALL_H} x={-HALL_HALF} y={(FLOOR_Y + CEIL_Y) / 2} z={MID_Z} ry={90} style={{ overflow: "hidden" }}>
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: "#dccbae",
          backgroundImage:
            "linear-gradient(to top, #a98f6d 0 7%, #b9a382 7% 11%, #cbb69a 11% 30%, #ddceb2 30% 100%)",
        }}
      />

      {/* the unbroken window run */}
      <span
        className="absolute inset-x-0"
        style={{
          top: "17%",
          height: "47%",
          backgroundImage: [
            "repeating-linear-gradient(to right, rgba(255,253,242,0.96) 0 186px, rgba(255,253,242,0.96) 186px, rgba(72,52,33,0.5) 186px 194px, transparent 194px 250px)",
            "linear-gradient(#fffdf4, #f3e8cd)",
          ].join(","),
          boxShadow: "0 0 70px 16px rgba(255,246,214,0.42)",
        }}
      />
      {/* glazing bars across the openings */}
      <span
        className="absolute inset-x-0"
        style={{ top: "40%", height: "2px", background: "rgba(72,52,33,0.32)" }}
      />
      {/* sills and a skirting, so the wall has depth at the joins */}
      <span
        className="absolute inset-x-0"
        style={{ top: "63.4%", height: "2.2%", background: "linear-gradient(#cbb08b, #a98a63)", boxShadow: "0 6px 14px -6px rgba(40,28,18,0.5)" }}
      />
      <span
        className="absolute inset-x-0 bottom-0"
        style={{ height: "6%", background: "linear-gradient(#9c815f, #7d6344)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.18)" }}
      />
      <Grain src="/collage/paper-newsprint.webp" size={380} opacity={0.2} />
      {/* coving shadow at the ceiling join */}
      <span
        className="absolute inset-x-0 top-0"
        style={{ height: "5%", background: "linear-gradient(rgba(40,28,18,0.28), transparent)" }}
      />
    </Plane>
  );
}

/** A classroom door: own frame, recessed reveal, kick plate, small window. */
function Door({ z }: { z: number }) {
  return (
    <Plane w={300} h={500} x={HALL_HALF - 1} y={FLOOR_Y - 250} z={z} ry={-90} className="hallway-door">
      {/* frame */}
      <span
        className="absolute -inset-[16px]"
        style={{ background: "linear-gradient(#93755537, #6f5438)", backgroundImage: "linear-gradient(#8a6c4d, #6c5236)" }}
      />
      {/* recessed shadow inside the frame */}
      <span className="absolute -inset-[4px]" style={{ background: "rgba(32,22,14,0.55)" }} />
      {/* slab */}
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(to right, #7a5d42, #96785a 46%, #87694a)",
          boxShadow: "inset 0 0 0 2px rgba(54,38,24,0.55), inset -10px 0 20px rgba(40,28,18,0.35)",
        }}
      >
        {/* small window */}
        <span
          className="absolute left-[19%] top-[10%] h-[24%] w-[62%]"
          style={{
            backgroundImage: "linear-gradient(#fbf3dc, #e8dab6)",
            boxShadow: "inset 0 0 0 3px rgba(48,34,22,0.55), 0 0 26px rgba(255,246,214,0.4)",
          }}
        />
        {/* kick plate */}
        <span
          className="absolute inset-x-0 bottom-0 h-[11%]"
          style={{ backgroundImage: "linear-gradient(#c0b090, #8d7a5e)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}
        />
        {/* handle */}
        <span
          className="absolute right-[10%] top-[50%] h-[11px] w-[11px] rounded-full"
          style={{ background: "#dcbf8d", boxShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
        />
      </span>
    </Plane>
  );
}

/* A locker is a box, not a picture of a locker: 110 wide along the wall, 420
   tall (against a 500 door, so its top sits above the 372 eye line) and 72 deep,
   stood off the wall so its top, its side return and the shadow it drops read as
   three dimensions. */
const LOCKER_W = 110;
const LOCKER_H = 420;
const LOCKER_D = 72;

function Locker({ z }: { z: number }) {
  const frontX = HALL_HALF - LOCKER_D;
  const yc = FLOOR_Y - LOCKER_H / 2;
  const midX = frontX + LOCKER_D / 2;
  return (
    <Fragment>
      {/* the shadow the box throws back onto the wall */}
      <Plane w={LOCKER_W + 10} h={LOCKER_H + 8} x={HALL_HALF - 1} y={yc + 8} z={z} ry={-90}>
        <span
          className="absolute inset-0"
          style={{ background: "radial-gradient(75% 62% at 50% 42%, rgba(28,22,14,0.5), rgba(28,22,14,0) 74%)" }}
        />
      </Plane>

      {/* the top: you look down onto it as you pass */}
      <Plane w={LOCKER_D} h={LOCKER_W} x={midX} y={FLOOR_Y - LOCKER_H} z={z} rx={90}>
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to right, #9aada0, #7d9286 62%, #667b6f)",
            boxShadow: "inset 0 -2px 0 rgba(255,255,255,0.22), inset 0 2px 4px rgba(30,38,32,0.4)",
          }}
        />
      </Plane>

      {/* the side return facing up the hall */}
      <Plane w={LOCKER_D} h={LOCKER_H} x={midX} y={yc} z={z + LOCKER_W / 2}>
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to right, #566a60, #42544b)",
            boxShadow: "inset 0 0 0 1px rgba(24,32,28,0.5)",
          }}
        />
      </Plane>

      {/* the door face: a recessed panel inside the carcass */}
      <Plane w={LOCKER_W} h={LOCKER_H} x={frontX} y={yc} z={z} ry={-90} className="hallway-locker">
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to right, #5d7267, #748a7e 40%, #5f7469)",
            boxShadow: "inset 0 0 0 2px rgba(36,44,38,0.55)",
          }}
        >
          <span
            className="absolute inset-[6%]"
            style={{
              backgroundImage: "linear-gradient(to right, #6f8578, #879d90 52%, #6d8276)",
              boxShadow:
                "inset 0 3px 0 rgba(255,255,255,0.12), inset 0 -3px 8px rgba(20,28,24,0.5), 0 0 0 1px rgba(30,40,34,0.35)",
            }}
          >
            {/* vents */}
            <span
              className="absolute inset-x-[20%] top-[6%] h-[9%]"
              style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(24,34,28,0.6) 0 2px, transparent 2px 6px)" }}
            />
            {/* number plate */}
            <span
              className="absolute left-1/2 top-[24%] h-[7%] w-[38%] -translate-x-1/2 rounded-[1px]"
              style={{ background: "linear-gradient(#d9cdb2, #c2b394)", boxShadow: "inset 0 0 0 1px rgba(40,34,24,0.35)" }}
            />
            {/* handle and hasp */}
            <span
              className="absolute left-1/2 top-[44%] h-[14px] w-[16px] -translate-x-1/2 rounded-[2px]"
              style={{ background: "#c9b489", boxShadow: "0 1px 2px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)" }}
            />
          </span>
          {/* plinth: the box stands on a dark kick, so it meets the floor */}
          <span className="absolute inset-x-0 bottom-0 h-[4.5%]" style={{ background: "rgba(20,16,11,0.4)" }} />
        </span>
      </Plane>
    </Fragment>
  );
}

/**
 * The right wall, nose to tail: a locker bank by the near end, the clear run the
 * pinboard hangs in (see `BOARD_Z`), then sound-barrier doors and more locker
 * banks all the way down to the stairwell door at the far end. None of it past the
 * board is reachable — it is there so the corridor reads as a building rather than
 * a backdrop.
 */
function LockerWall() {
  return (
    <>
      <Plane w={HALL_LEN} h={HALL_H} x={HALL_HALF} y={(FLOOR_Y + CEIL_Y) / 2} z={MID_Z} ry={-90} style={{ overflow: "hidden" }}>
        <span
          className="absolute inset-0"
          style={{
            backgroundColor: "#dccbae",
            backgroundImage:
              "linear-gradient(to top, #a98f6d 0 7%, #b9a382 7% 11%, #d3c0a3 11% 32%, #ded0b5 32% 100%)",
          }}
        />
        <span
          className="absolute inset-x-0 bottom-0"
          style={{ height: "6%", background: "linear-gradient(#9c815f, #7d6344)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.18)" }}
        />
        <Grain src="/collage/paper-kraft.webp" size={420} opacity={0.26} />
        <span
          className="absolute inset-x-0 top-0"
          style={{ height: "5%", background: "linear-gradient(rgba(40,28,18,0.28), transparent)" }}
        />
      </Plane>

      {run(60, -560, 118).map((z) => (
        <Locker key={`a${z}`} z={z} />
      ))}

      {[-1420].map((z) => (
        <Door key={z} z={z} />
      ))}
      {run(-1660, -1900, 118).map((z) => (
        <Locker key={`b${z}`} z={z} />
      ))}

      {[-2170].map((z) => (
        <Door key={z} z={z} />
      ))}
      {run(-2360, -2620, 118).map((z) => (
        <Locker key={`c${z}`} z={z} />
      ))}

      {[-2910].map((z) => (
        <Door key={z} z={z} />
      ))}
      {run(-3080, -3220, 118).map((z) => (
        <Locker key={`d${z}`} z={z} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------- the stairwell */

const STAIR_OPEN_W = 560; // the opening in the end wall
const STAIR_OPEN_H = 520; // floor to head, so a person clears it

/* The view through the opening is a drawn back plate, not modelled planes. A
   flight built out of CSS planes read as a striped ramp from the settle: full
   width treads seen from an eye thirty-four metres back collapse into horizontal
   bands with nothing flanking them, and the plane edges bowed. The plate is
   drawn in the same one-point projection as the hall — a landing, the wall
   returning to the shaft, and a six-tread flight with tread tops, riser faces,
   nosing highlights, a balustrade post on every step and a newel on the bottom
   landing — so the end of the hall reads as a stairwell rather than a backdrop. */

const PLATE_W = 560;
const PLATE_H = 520;

/* The flight, in plate pixels: six treads dropping away to the left, each drawn as a
   top surface plus a riser face, so both depth and tread depth read at a glance. */
const PLATE_TREADS: [number, number][][] = [
  [[500, 318], [444, 318], [468, 288], [524, 288]],
  [[444, 340], [388, 340], [412, 310], [468, 310]],
  [[388, 362], [332, 362], [356, 332], [412, 332]],
  [[332, 384], [276, 384], [300, 354], [356, 354]],
  [[276, 406], [220, 406], [244, 376], [300, 376]],
  [[220, 428], [164, 428], [188, 398], [244, 398]],
];
const PLATE_RISERS: [number, number][][] = [
  [[444, 318], [444, 340], [468, 310], [468, 288]],
  [[388, 340], [388, 362], [412, 332], [412, 310]],
  [[332, 362], [332, 384], [356, 354], [356, 332]],
  [[276, 384], [276, 406], [300, 376], [300, 354]],
  [[220, 406], [220, 428], [244, 398], [244, 376]],
  [[164, 428], [164, 450], [188, 420], [188, 398]],
];
const PLATE_NOSINGS = [[444, 318, 468, 288], [388, 340, 412, 310], [332, 362, 356, 332], [276, 384, 300, 354], [220, 406, 244, 376], [164, 428, 188, 398]];
const PLATE_BODY = "500,318 444,318 444,340 388,340 388,362 332,362 332,384 276,384 276,406 220,406 220,428 164,428 164,450 164,520 560,520 560,318";
/* the same sawtooth pushed toward the vanishing point: the flight's far stringer,
   which gives it thickness instead of reading as a flat cutout */
const PLATE_BODY_FAR = "538,272 482,272 482,294 426,294 426,316 370,316 370,338 314,338 314,360 258,360 258,382 202,382 202,404 202,474 598,474 598,272";

const PLATE_RAIL = "444,256 388,278 332,300 276,322 220,344 164,366 164,388";
const PLATE_POSTS: [number, number][] = [[444, 318], [388, 340], [332, 362], [276, 384], [220, 406], [164, 428]];
const PLATE_NEWEL: [number, number] = [164, 450];
const PLATE_BOTTOM = 450;


function Stairwell() {
  const half = STAIR_OPEN_W / 2;
  const sideW = HALL_HALF - half;
  const sideX = half + sideW / 2;
  const yc = (FLOOR_Y + CEIL_Y) / 2;
  const headY = FLOOR_Y - STAIR_OPEN_H;
  const headH = headY - CEIL_Y;

  return (
    <>
      {/* the end wall, built around the opening */}
      {[-sideX, sideX].map((x) => (
        <Plane key={x} w={sideW} h={HALL_H} x={x} y={yc} z={FAR_Z} style={{ overflow: "hidden" }}>
          <span
            className="absolute inset-0"
            style={{ backgroundColor: "#cfbd9f", backgroundImage: "linear-gradient(#d8c7aa, #bfa987 72%, #b09774)" }}
          />
          <span
            className="absolute inset-x-0 bottom-0"
            style={{ height: "7%", background: "linear-gradient(#9c815f, #7d6344)" }}
          />
          <Grain src="/collage/paper-newsprint.webp" size={400} opacity={0.22} />
        </Plane>
      ))}
      {/* header over the opening, with the stair sign */}
      <Plane w={STAIR_OPEN_W} h={headH} y={CEIL_Y + headH / 2} z={FAR_Z} style={{ overflow: "hidden" }}>
        <span
          className="absolute inset-0"
          style={{ backgroundColor: "#cfbd9f", backgroundImage: "linear-gradient(#d8c7aa, #bfa987)" }}
        />
        <span
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 px-3 py-[3px] font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ background: "#1f6b4a", color: "#f4efdf", boxShadow: "0 2px 6px rgba(20,26,20,0.5)" }}
        >
          stairs ↓
        </span>
        <Grain src="/collage/paper-newsprint.webp" size={400} opacity={0.2} />
      </Plane>

      {/* the stairwell itself: a drawn plate on the back of the opening */}
      <Plane
        w={STAIR_OPEN_W}
        h={STAIR_OPEN_H}
        y={(FLOOR_Y + headY) / 2}
        z={FAR_Z - 4}
        style={{ overflow: "hidden", background: "#c4b18d" }}
      >
        <svg
          viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="stair-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d9caac" />
              <stop offset="0.62" stopColor="#c4b18d" />
              <stop offset="1" stopColor="#9c8968" />
            </linearGradient>
            <linearGradient id="stair-soffit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6d5942" />
              <stop offset="1" stopColor="#332b22" />
            </linearGradient>
            <linearGradient id="stair-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7efd9" />
              <stop offset="1" stopColor="#e8dbbe" />
            </linearGradient>
            <radialGradient id="stair-lamp" cx="0.16" cy="0.12" r="0.66">
              <stop offset="0" stopColor="#fff7e2" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff7e2" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="stair-haze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a2118" stopOpacity="0" />
              <stop offset="1" stopColor="#2a2118" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="stair-head" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6b5942" />
              <stop offset="1" stopColor="#b09c79" />
            </linearGradient>
          </defs>

          <rect width={PLATE_W} height={PLATE_H} fill="url(#stair-wall)" />
          {/* the high window the stairwell is lit from */}
          <rect x="96" y="86" width="150" height="104" fill="url(#stair-sky)" />
          <rect x="96" y="86" width="150" height="104" fill="none" stroke="#8b7756" strokeWidth="5" />
          <rect x="168" y="86" width="5" height="104" fill="#8b7756" />
          <rect x="96" y="134" width="150" height="4" fill="#8b7756" opacity="0.8" />
          {/* the wall returning to the shaft */}
          <polygon points="560,0 560,520 500,470 500,60" fill="#ab9673" />
          <polygon points="500,60 500,470 488,472 488,74" fill="#7c6a4d" opacity="0.5" />
          {/* ceiling soffit */}
          <rect x="0" y="0" width={PLATE_W} height="34" fill="url(#stair-head)" />
          <rect x="0" y="34" width={PLATE_W} height="6" fill="#3d3226" opacity="0.45" />
          {/* the bottom landing the flight arrives at */}
          <polygon points={`0,520 0,${PLATE_BOTTOM - 6} 164,${PLATE_BOTTOM - 6} 234,520`} fill="#c6b492" />
          <rect x="0" y={PLATE_BOTTOM - 6} width="164" height="3" fill="#8b7756" opacity="0.5" />
          {/* the flight: soffit, riser faces, tread tops, nosing highlights */}
          <polygon points={PLATE_BODY_FAR} fill="#8a7657" />
          <polygon points={PLATE_BODY} fill="url(#stair-soffit)" />
          {PLATE_RISERS.map((pts, i) => (
            <polygon key={`riser${i}`} points={pts.map(([px, py]) => `${px},${py}`).join(" ")} fill="#4b3d2d" />
          ))}
          {PLATE_TREADS.map((pts, i) => (
            <polygon key={`tread${i}`} points={pts.map(([px, py]) => `${px},${py}`).join(" ")} fill="#e4d5b6" />
          ))}
          {PLATE_NOSINGS.map(([ax, ay, bx, by], i) => (
            <line key={`nose${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke="#fdf7e6" strokeWidth="2.6" opacity="0.92" />
          ))}
          {/* balustrade: a post on every step, a newel at the bottom */}
          <polyline points={PLATE_RAIL} fill="none" stroke="#38453d" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
          {PLATE_POSTS.map(([px, py], i) => (
            <rect key={`post${i}`} x={px - 2.5} y={py - 62} width="5" height="62" fill="#38453d" opacity="0.92" />
          ))}
          <rect x={PLATE_NEWEL[0] - 3.5} y={PLATE_NEWEL[1] - 62} width="7" height="62" fill="#38453d" />
          <rect x={PLATE_NEWEL[0] - 6} y={PLATE_NEWEL[1] - 4} width="12" height="6" fill="#2f3a33" />
          {/* light from the window, and the dark of the well below */}
          <rect width={PLATE_W} height={PLATE_H} fill="url(#stair-lamp)" />
          <rect y="250" width={PLATE_W} height="270" fill="url(#stair-haze)" />
        </svg>
      </Plane>
    </>
  );
}

/* ------------------------------------------------------------------- the board */

const TILT = [-2.4, 2.8, 1.7, -3.1];

function BoardFlyer({
  club,
  index,
  interactive,
  unpinning,
  onOpen,
}: {
  club: HallwayClub;
  index: number;
  interactive: boolean;
  unpinning: boolean;
  onOpen: () => void;
}) {
  return (
    <div
      className="relative h-full w-full"
      style={{ transform: `rotate(${TILT[index % TILT.length]}deg)`, transition: "transform 220ms cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      <div className="hallway-sheet-idle h-full w-full" style={{ animationDelay: `${index * 1.3}s` }}>
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`Unpin ${club.name}`}
          tabIndex={interactive ? 0 : -1}
          className="group relative block h-full w-full text-left focus-visible:outline-none"
          style={{ pointerEvents: interactive ? "auto" : "none" }}
        >
          <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[58%]">
            <Pin size={+(12 * BOARD_RASTER).toFixed(2)} />
          </span>
          <span
            className={`torn-soft flex h-full w-full flex-col justify-between bg-paper px-[7%] py-[6%] shadow-[var(--shadow-lift)] transition-[transform,opacity] duration-300 ease-[var(--ease-paper)] ${
              interactive ? "group-hover:-translate-y-2 group-hover:scale-[1.015] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-ink" : ""
            } motion-reduce:transition-none`}
            style={
              unpinning
                ? { transform: "translate3d(6px, -26px, 40px) rotate(-7deg) scale(1.06)", opacity: 0 }
                : undefined
            }
          >
            <span className="flex items-start justify-between" style={{ gap: u(12) }}>
              <span className="font-mono uppercase tracking-[0.16em] text-ink-soft" style={{ fontSize: u(10) }}>
                {club.tag}
              </span>
              <span className="tnum font-mono uppercase tracking-[0.16em] text-ink-3" style={{ fontSize: u(10) }}>
                {String(index + 1).padStart(2, "0")} / 04
              </span>
            </span>

            <span className="block font-serif leading-[0.9] text-ink" style={{ marginTop: u(4), fontSize: u(30) }}>
              {club.name}
            </span>
            <span className="scrawl block leading-[1.1] text-ink" style={{ marginTop: u(4), fontSize: u(15) }}>
              {club.tagline}
            </span>

            <span className="block border-t border-ink/15" style={{ marginTop: u(8), paddingTop: u(8) }}>
              <span className="block font-mono uppercase tracking-[0.1em] text-ink-2" style={{ fontSize: u(9.5) }}>
                {club.cadence}
              </span>
              <span className="block font-mono uppercase tracking-[0.1em] text-ink-3" style={{ marginTop: u(2), fontSize: u(9.5) }}>
                {club.nextEvent ? `next · ${club.nextEvent.when}` : "no date pinned"}
              </span>
            </span>

            <span className="flex items-center justify-between" style={{ marginTop: u(8), gap: u(8) }}>
              <span className="font-mono uppercase tracking-[0.14em] text-ink-soft" style={{ fontSize: u(9) }}>
                {club.status === "active" ? "running now" : "chartering"}
              </span>
              <span
                className="font-mono uppercase tracking-[0.14em] text-ink-3 underline decoration-ink/25"
                style={{ fontSize: u(9), textUnderlineOffset: u(3) }}
              >
                unpin →
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

/** The board's art at its displayed raster size: authored at BOARD_W ×
 *  BOARD_RASTER, then fitted into the 420 × 300 plane by the inverse scale, so
 *  the glyphs are rasterised once, at display size. */
function BoardArt({ clubs, armed, onOpen }: { clubs: HallwayClub[]; armed: boolean; onOpen: (index: number) => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden shadow-[-18px_26px_40px_-12px_rgba(36,26,21,0.65),0_50px_90px_-30px_rgba(36,26,21,0.7)]">
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: +(BOARD_W * BOARD_RASTER).toFixed(2),
          height: +(BOARD_H * BOARD_RASTER).toFixed(2),
          transform: `scale(${(1 / BOARD_RASTER).toFixed(5)})`,
          transformOrigin: "0 0",
        }}
      >
        <CorridorBoard clubs={clubs} armed={armed} onOpen={onOpen} />
      </div>
    </div>
  );
}

function CorridorBoard({
  clubs,
  armed,
  onOpen,
}: {
  clubs: HallwayClub[];
  armed: boolean;
  onOpen: (index: number) => void;
}) {
  const [unpinning, setUnpinning] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const open = (index: number) => {
    if (!armed) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onOpen(index);
      return;
    }
    setUnpinning(index);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setUnpinning(null);
      onOpen(index);
    }, 300);
  };

  return (
    <div
      className="h-full w-full"
      style={{
        padding: u(26),
        backgroundImage: "linear-gradient(160deg, #7a5836, #5c4026 58%, #6b4b2e)",
      }}
    >
      <div
        className="tex-cork relative h-full w-full overflow-hidden"
        style={{
          // the cork grain is a bitmap tile: its size follows the raster canvas,
          // or the grain would read 2.5x finer than the board around it
          backgroundSize: `${+(720 * BOARD_RASTER).toFixed(0)}px auto`,
          boxShadow: "inset 0 2px 26px rgba(52,34,18,0.5), inset 0 0 0 2px rgba(40,28,18,0.35)",
        }}
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,246,224,0.24),transparent_62%)]" />

        <div className="pointer-events-none absolute inset-x-0 top-[2.4%] flex items-start justify-between px-[3%]">
          <span
            className="bg-paper font-mono uppercase tracking-[0.16em] text-ink-2 shadow-[var(--shadow-scrap)]"
            style={{ padding: `${u(4)} ${u(12)}`, fontSize: u(10) }}
          >
            founders, inc. · pier 2
          </span>
          <span
            className="rotate-[-2deg] bg-paper/90 font-mono uppercase tracking-[0.14em] text-ink-soft shadow-[var(--shadow-scrap)]"
            style={{ padding: `${u(4)} ${u(10)}`, fontSize: u(10) }}
          >
            the four clubs
          </span>
        </div>

        <div className="absolute inset-x-[3.4%] bottom-[4%] top-[12%] grid grid-cols-2 grid-rows-2 gap-x-[3.4%] gap-y-[4%]">
          {clubs.map((club, index) => (
            <BoardFlyer
              key={club.slug}
              club={club}
              index={index}
              interactive={armed}
              unpinning={unpinning === index}
              onOpen={() => open(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- component */

const IDLE_CSS = `
@keyframes hallway-sheet-idle {
  0%, 100% { transform: rotate(-0.35deg); }
  50% { transform: rotate(0.35deg); }
}
.hallway-sheet-idle { animation: hallway-sheet-idle 7.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .hallway-sheet-idle { animation: none; }
}
`;

export default function HallwayCorridor({ clubs, onOpen }: { clubs: HallwayClub[]; onOpen: (index: number) => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);

  // Seeded from the media query at mount (this module is client-only, see
  // hallway.tsx) so a reduced-motion visitor starts already settled instead of
  // being settled from inside the effect, which React's compiler rules forbid.
  const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [armed, setArmed] = useState(prefersReduced);
  const [locked, setLocked] = useState(prefersReduced);

  const paint = useCallback((p: number, head: { x: number; y: number; yaw: number; pitch: number }) => {
    const stage = stageRef.current;
    const camera = cameraRef.current;
    if (!stage || !camera) return;
    const c = cameraAt(p);
    camera.style.transform = `translate3d(${(c.x + head.x).toFixed(2)}px, ${(c.y + head.y).toFixed(2)}px, ${c.z.toFixed(2)}px) rotateY(${(c.yaw + head.yaw).toFixed(3)}deg) rotateX(${(c.pitch + head.pitch).toFixed(3)}deg) rotateZ(${c.roll.toFixed(3)}deg)`;
    stage.style.setProperty("--p", p.toFixed(4));
    // The board is a fixed piece of the wall now, so the only per-viewport
    // correction is a single 2D scale on the projection: narrow screens shrink the
    // settled view instead of cropping the flyers off the edge of the board.
    stage.style.setProperty("--fit", fitScale(stage.clientWidth, stage.clientHeight).toFixed(4));
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const camera = cameraRef.current;
    if (!stage || !camera) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = () => reduceMq.matches;

    /* ---- the walk state: a target, a damped current value, a one-way lock ---- */
    let current = isReduced() ? 1 : 0;
    let target = current;
    let isLocked = isReduced();
    let isArmed = isReduced() || current > 0.9;
    let inView = true;
    let raf = 0;
    let last = 0;
    const head = { x: 0, y: 0, yaw: 0, pitch: 0 };
    const headTarget = { x: 0, y: 0, yaw: 0, pitch: 0 };

    paint(current, head);

    const wake = () => {
      if (raf) return;
      last = 0;
      raf = window.requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;

      // exponential damp — frame-rate independent, no overshoot, no steps
      const follow = 1 - Math.exp(-dt / 90);
      current += (target - current) * follow;
      if (Math.abs(target - current) < 0.0004) current = target;

      const hFollow = 1 - Math.exp(-dt / 160);
      head.x += (headTarget.x - head.x) * hFollow;
      head.y += (headTarget.y - head.y) * hFollow;
      head.yaw += (headTarget.yaw - head.yaw) * hFollow;
      head.pitch += (headTarget.pitch - head.pitch) * hFollow;

      paint(current, head);

      if (!isArmed && current > 0.88) {
        isArmed = true;
        setArmed(true);
      }
      // lock as soon as the walk is committed to the end — a hair short of 1 is
      // still "the end" to the person scrolling, and a rewind from here would undo
      // the whole walk
      if (!isLocked && target >= 1 && current >= 0.98) {
        isLocked = true;
        target = 1;
        current = 1;
        paint(current, head);
        setLocked(true);
      }

      const busy =
        Math.abs(target - current) > 0.0005 ||
        Math.abs(headTarget.x - head.x) + Math.abs(headTarget.y - head.y) + Math.abs(headTarget.yaw - head.yaw) + Math.abs(headTarget.pitch - head.pitch) > 0.02;

      raf = busy ? window.requestAnimationFrame(tick) : 0;
      if (!busy) last = 0;
    };

    const bump = (dP: number) => {
      if (isLocked || isReduced()) return;
      target = clamp(target + dP);
      if (target >= 0.9999) target = 1;
      wake();
    };

    /* ---- wheel: one notch is one eighth of the walk ---- */
    const onWheel = (event: WheelEvent) => {
      if (isLocked || isReduced() || !inView) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const d = Math.max(-320, Math.min(320, event.deltaY * unit));
      bump(d * GAIN);
    };

    /* ---- touch: a swipe is the same walk ---- */
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (isLocked || isReduced() || !inView) return;
      const y = event.touches[0]?.clientY ?? touchY;
      const dy = touchY - y;
      touchY = y;
      if (Math.abs(dy) < 0.5) return;
      event.preventDefault();
      bump(dy * GAIN * 1.6);
    };

    /* ---- keyboard ---- */
    const onKey = (event: KeyboardEvent) => {
      if (isLocked || isReduced() || !inView) return;
      const el = event.target as HTMLElement | null;
      if (el && el.closest("a, button, input, textarea, select, [role='dialog']")) return;
      let d: number | null = null;
      if (event.key === "ArrowDown") d = STEP * 0.5;
      else if (event.key === "ArrowUp") d = -STEP * 0.5;
      else if (event.key === " " || event.key === "PageDown") d = STEP;
      else if (event.key === "PageUp") d = -STEP;
      else if (event.key === "Home") d = -1;
      else if (event.key === "End") d = 1;
      if (d === null) return;
      event.preventDefault();
      bump(d);
    };

    /* ---- head parallax: the camera follows the pointer, damped ---- */
    const onPointer = (event: PointerEvent) => {
      if (isReduced() || event.pointerType === "touch" || !inView) return;
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      headTarget.x = -nx * 16;
      headTarget.y = -ny * 9;
      headTarget.yaw = -nx * 1.7;
      headTarget.pitch = ny * 1.0;
      wake();
    };
    const resetHead = () => {
      headTarget.x = 0;
      headTarget.y = 0;
      headTarget.yaw = 0;
      headTarget.pitch = 0;
      wake();
    };

    const onResize = () => paint(current, head);
    const onReduceChange = () => {
      if (isReduced()) {
        target = 1;
        current = 1;
        isLocked = true;
        isArmed = true;
        setArmed(true);
        setLocked(true);
        paint(current, head);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = (entries[0]?.intersectionRatio ?? 0) > 0.5;
      },
      { threshold: [0, 0.5, 0.75, 1] },
    );
    io.observe(stage);

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetHead);
    window.addEventListener("resize", onResize);
    reduceMq.addEventListener("change", onReduceChange);

    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("mouseleave", resetHead);
      window.removeEventListener("resize", onResize);
      reduceMq.removeEventListener("change", onReduceChange);
      io.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [paint]);

  return (
    <div
      id="hallway-track"
      className="relative h-[calc(100dvh-4rem)] overflow-hidden bg-[#e6dbc9]"
      style={{ overscrollBehavior: "none" }}
    >
      <style dangerouslySetInnerHTML={{ __html: IDLE_CSS }} />
      <div
        id="hallway-stage"
        ref={stageRef}
        className="absolute inset-0 overflow-hidden bg-[#e6dbc9]"
        style={{ "--p": 0, touchAction: "pan-x" } as CSSProperties}
      >
        <p className="sr-only">
          A first-person walk down the Pier 2 hallway to the club pinboard. Scroll to walk, or use
          “Skip to the board” to jump straight to the four flyers.
        </p>

        {/* the 3D stage: perspective parent → camera → world */}
        <div
          className="absolute inset-0"
          style={{
            perspective: `${PERSPECTIVE}px`,
            perspectiveOrigin: "50% 50%",
            transform: "scale(var(--fit, 1))",
          }}
        >
          <div
            ref={cameraRef}
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
              transform: "translate3d(0px, 0px, 0px)",
            }}
          >
            <Floor />
            <Ceiling />
            <CeilingLights />
            <WindowWall />
            <LockerWall />
            <Stairwell />

            {/* --------- the pinboard, on the right-hand wall --------- */}
            <Plane
              w={BOARD_W}
              h={BOARD_H}
              x={BOARD_X}
              y={BOARD_Y}
              z={BOARD_Z}
              ry={-90}
              className="hallway-board"
            >
              {/* while walking, the board is the 3D plane; once settled it is
                  handed to the flat layer below, which the browser rasterises at
                  display size (a 3D-transformed layer is rasterised at its layout
                  size and the projection stretches that texture, which is what
                  softened the flyers) */}
              <BoardArt clubs={clubs} armed={armed} onOpen={onOpen} />
            </Plane>
          </div>
        </div>

        {/* light and haze, so depth reads: warmer near the windows, softer far off */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(78% 66% at 14% 40%, rgba(255,248,228,0.42), transparent 62%), radial-gradient(120% 100% at 50% 55%, transparent 42%, rgba(36,26,21,0.26) 100%)",
          }}
        />

        {/* stage furniture: skip control is first in the tab order here */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 pt-4 sm:px-7 sm:pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            second floor · hallway east
          </p>
          {locked ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              the board · unpin a flyer to read it
            </p>
          ) : (
            <a
              href="#board"
              className="pill-btn-secondary pointer-events-auto inline-flex min-h-[40px] shrink-0 items-center px-4 text-[11px]"
            >
              Skip to the board ↓
            </a>
          )}
        </div>

        {/* walk hint */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center"
          style={{ opacity: "max(0, min(1, calc((0.34 - var(--p, 0)) * 6)))" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            keep scrolling — walk up to the board
          </p>
        </div>

        {/* settled: the way onward, so the lock never traps anyone */}
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 px-5 pb-4 transition-opacity duration-300 ${
            locked ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ opacity: "max(0, min(1, calc((var(--p, 0) - 0.9) * 10)))" }}
        >
          <a href="#board" className="pill-btn inline-flex min-h-[40px] items-center px-5 text-[12px]">
            Continue below ↓
          </a>
          <Link href="/clubs/overview" className="pill-btn-secondary inline-flex min-h-[40px] items-center px-5 text-[12px]">
            See everything at a glance →
          </Link>
        </div>
      </div>
    </div>
  );
}
