"use client";

/**
 * Scene dressing — the objects around the clubhouse board.
 *
 * Two layers, one art direction (kraft, printer paper, ink, tape, pins):
 *
 *   BoardDressing  pinned inside the pinboard, positioned in percentages of the
 *                  cork — so the identical tree reads at walk size and at settle
 *                  size, in the 3D plane and in the hoisted display layer.
 *   RoomDressing   the wall below the hallway walk: a dado, a skirting, a pennant
 *                  string, a clock, a coat hook with a lanyard, a shelf of objects
 *                  and a few things standing on the floor. Drawn flat, from the
 *                  paper kit, and kept in the page gutters so it can never crowd
 *                  the board or the type.
 *
 * Nothing here carries copy or state: no words that could contradict a page, no
 * interactive element. Everything is `aria-hidden` and `pointer-events-none`, and
 * every colour comes from a token.
 */

/* ------------------------------------------------------------ on the board */

/** Bunting, a grease-pencil ring, spare pins and a strip of tape, pinned over the
 *  cork so the seams between the sheets read as a working board rather than a
 *  layout. Percentage geometry only — no unit maths, no type. */
export function BoardDressing() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* bunting, hung slack between two pins across the top-left corner */}
      <svg
        viewBox="0 0 120 26"
        preserveAspectRatio="none"
        className="absolute left-[1.5%] top-[2.4%] h-[15%] w-[54%]"
      >
        <path
          d="M0 5 Q 60 17 120 6"
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.26"
          strokeWidth="0.7"
        />
        {[12, 34, 56, 78, 100].map((x, i) => {
          const y = 5 + Math.sin((x / 120) * Math.PI) * 9;
          return (
            <polygon
              key={x}
              points={`${x - 5.5},${y} ${x + 5.5},${y} ${x},${y + 12}`}
              fill={i % 2 === 0 ? "var(--paper)" : "var(--kraft)"}
              stroke="var(--ink)"
              strokeOpacity="0.24"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>

      {/* grease pencil, drawn round the corner nobody ever unpins */}
      <span
        className="absolute left-[63%] top-[4%] h-[20%] w-[18%] -rotate-[6deg] rounded-[50%]"
        style={{ border: "2px solid color-mix(in srgb, var(--ink) 20%, transparent)" }}
      />

      {/* a strip of masking tape holding a scrap of blank stock */}
      <span className="absolute left-[7%] top-[41%] h-[10%] w-[13%] rotate-[-8deg] bg-paper/70 shadow-[var(--shadow-scrap)]" />
      <span
        className="absolute left-[9%] top-[39.5%] h-[4.5%] w-[8%] rotate-[-14deg]"
        style={{ background: "color-mix(in srgb, var(--paper-deep) 78%, transparent)" }}
      />

      {/* two spare pins pushed into the cork, not holding anything */}
      <span className="absolute left-[74%] top-[86%] block h-[3.2%] w-[2.2%] -rotate-[12deg] rounded-full bg-ink/45" />
      <span className="absolute left-[79%] top-[90%] block h-[3%] w-[2%] rotate-[8deg] rounded-full bg-ink/35" />
    </div>
  );
}

/* ------------------------------------------------- the wall below the walk */

/** A wall clock, hands at a plausible past-club-hour time. */
function Clock() {
  return (
    <div className="relative h-16 w-16 rounded-full bg-paper shadow-[var(--shadow-scrap)] ring-1 ring-ink/20">
      <span className="absolute inset-[13%] rounded-full border border-ink/12" />
      <span className="absolute left-1/2 top-1/2 h-[26%] w-[1.5px] origin-bottom -translate-x-1/2 -translate-y-full rotate-[38deg] bg-ink/70" />
      <span className="absolute left-1/2 top-1/2 h-[38%] w-px origin-bottom -translate-x-1/2 -translate-y-full rotate-[-64deg] bg-ink/50" />
      <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/60" />
    </div>
  );
}

/** A coat hook with a member's lanyard still on it. */
function Hook() {
  return (
    <div className="relative h-36 w-14">
      <span className="absolute left-1/2 top-0 h-3 w-[7px] -translate-x-1/2 rounded-b-[4px] border-x border-b border-ink/35" />
      <span className="absolute left-1/2 top-3 h-16 w-[1.5px] -translate-x-1/2 bg-ink/25" />
      <span className="absolute left-1/2 top-16 h-16 w-11 -translate-x-1/2 rounded-[2px] border border-ink/25 bg-paper shadow-[var(--shadow-scrap)]">
        <span className="absolute inset-x-2 top-2 h-[2px] bg-ink/25" />
        <span className="absolute inset-x-2 top-4 h-[2px] w-4 bg-ink/15" />
      </span>
    </div>
  );
}

/** A shelf of clubhouse objects: a tape roll, a bottle, a crate, three manuals. */
function Shelf() {
  return (
    <div className="relative w-56">
      <div className="relative flex h-16 items-end justify-start gap-3">
        {/* manuals */}
        <span className="flex flex-col gap-[3px]">
          <span className="h-[7px] w-12 bg-ink/25" />
          <span className="h-[7px] w-14 bg-ink/18" />
          <span className="h-[7px] w-11 bg-ink/12" />
        </span>
        {/* tape roll */}
        <span className="h-11 w-11 rounded-full border-[6px] border-ink/25" />
        {/* crate */}
        <span className="relative h-10 w-14 border border-ink/25 bg-paper">
          <span className="absolute inset-x-0 top-1/3 h-px bg-ink/20" />
          <span className="absolute inset-x-0 top-2/3 h-px bg-ink/20" />
        </span>
        {/* bottle */}
        <span className="relative h-14 w-4 rounded-t-[3px] rounded-b-[2px] border border-ink/25 bg-paper">
          <span className="absolute inset-x-[3px] top-[-8px] h-2 rounded-t-[2px] border border-ink/25 bg-paper" />
        </span>
      </div>
      {/* the board itself */}
      <span className="block h-[6px] w-full rounded-[1px] bg-ink/30 shadow-[0_3px_6px_-2px_rgba(36,26,21,0.35)]" />
      <span className="mx-4 block h-[3px] border-x border-ink/20" />
    </div>
  );
}

/** A rolled poster and a crate on the floor, the way a real hallway ends up. */
function FloorGoods() {
  return (
    <div className="relative h-20 w-40">
      <span className="absolute bottom-0 left-1 h-16 w-7 rotate-[-6deg] rounded-t-[3px] border border-ink/25 bg-paper">
        <span className="absolute inset-x-0 top-2 h-px bg-ink/20" />
        <span className="absolute inset-x-0 top-5 h-px bg-ink/15" />
        <span className="absolute inset-x-0 top-8 h-px bg-ink/12" />
      </span>
      <span className="absolute bottom-0 left-14 h-9 w-11 border border-ink/25 bg-paper shadow-[var(--shadow-scrap)]" />
      <span className="absolute bottom-9 left-16 h-7 w-9 border border-ink/22 bg-paper" />
      <span className="absolute bottom-0 right-0 h-11 w-9 rounded-t-full border border-ink/20 bg-paper/80" />
    </div>
  );
}

/** The wall the board hangs on, below the hallway walk: dado, skirting, a pennant
 *  string, and the objects that live on that wall. Everything sits in the page
 *  gutters or along the section edges, at low contrast, so it reads as the room
 *  and never competes with the board. */
export function RoomDressing() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* the painted wall, and the dado rail it is painted up to */}
      <div
        className="absolute inset-x-0 top-0 h-[74%]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--paper-deep) 55%, transparent) 0%, transparent 62%)",
        }}
      />
      <div className="absolute inset-x-0 top-[74%] border-t border-ink/10" />

      {/* skirting, so the wall meets the floor */}
      <div className="absolute inset-x-0 bottom-0 h-[10px] border-t-2 border-ink/15 bg-paperdeep" />

      {/* pennant string along the top of the wall */}
      <svg
        viewBox="0 0 600 28"
        preserveAspectRatio="none"
        className="absolute left-0 top-0 h-8 w-full opacity-70"
      >
        <path d="M0 4 Q 300 22 600 5" fill="none" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="1" />
        {Array.from({ length: 11 }, (_, i) => 24 + i * 55).map((x, i) => {
          const y = 4 + Math.sin((x / 600) * Math.PI) * 12;
          return (
            <polygon
              key={x}
              points={`${x - 9},${y} ${x + 9},${y} ${x},${y + 15}`}
              fill={i % 2 === 0 ? "var(--paper)" : "var(--kraft)"}
              stroke="var(--ink)"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>

      {/* the objects, only where there is gutter to hold them */}
      <div className="absolute right-6 top-6 hidden 2xl:block">
        <Clock />
      </div>
      <div className="absolute left-8 top-24 hidden 2xl:block">
        <Hook />
      </div>
      <div className="absolute right-8 top-[38%] hidden 2xl:block">
        <Shelf />
      </div>
      <div className="absolute bottom-3 left-6 hidden xl:block">
        <FloorGoods />
      </div>
    </div>
  );
}
