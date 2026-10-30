"use client";

/**
 * The board, as a collage.
 *
 * On a wide screen this is not a grid: it is a board with things *on* it at
 * fixed, hand-placed coordinates — four club sheets at four different sizes and
 * angles, over and under prints, pencil notes, cut-outs, tape and pins, with
 * sheets overlapping each other the way pinned paper actually stacks.
 *
 * Below `lg` the same content falls back to a single scrolling column of
 * sheets (a board of overlapping textures does not survive a phone), each
 * keeping its own print tucked behind it.
 *
 * Every sheet is a real button; every prop is `aria-hidden` and inert.
 */

import Image from "next/image";
import Link from "next/link";
import type { HallwayClub } from "./types";

/* ------------------------------------------------------------------ the cast */

type Piece = {
  src: string;
  /** absolute box on the board, in % */
  left: number;
  top: number;
  width: number;
  rotate: number;
  z: number;
  /** prints get a paper edge + shadow; cut-outs are already transparent */
  kind: "print" | "cut" | "note";
  /** 3:2 for prints and cut-outs, 1:1 for notes */
  ratio?: string;
};

const PIECES: Piece[] = [
  // prints
  { src: "/collage/board/photo-track.webp", left: 21.5, top: -2.5, width: 21, rotate: -6.5, z: 4, kind: "print" },
  { src: "/collage/board/photo-garage.webp", left: 66, top: -3.5, width: 19, rotate: 5, z: 4, kind: "print" },
  { src: "/collage/board/photo-court.webp", left: 33, top: 40, width: 17, rotate: 4.5, z: 6, kind: "print" },
  { src: "/collage/board/photo-woods.webp", left: 85.5, top: 34, width: 16, rotate: -7, z: 6, kind: "print" },
  // cut-outs
  { src: "/collage/board/cut-wheel.webp", left: 27, top: 12, width: 13, rotate: 9, z: 9, kind: "cut" },
  { src: "/collage/board/cut-gear.webp", left: 62, top: 14, width: 11, rotate: -11, z: 9, kind: "cut" },
  { src: "/collage/board/cut-hoops.webp", left: 3, top: 44, width: 12, rotate: -8, z: 9, kind: "cut" },
  { src: "/collage/board/cut-mask.webp", left: 51, top: 44, width: 11, rotate: 6, z: 9, kind: "cut" },
  { src: "/collage/board/cut-creature.webp", left: 47, top: 74, width: 8, rotate: -9, z: 9, kind: "cut" },
  // tape, pins, notes
  { src: "/collage/board/tape-pair.webp", left: 36.5, top: 26, width: 9, rotate: -22, z: 9, kind: "cut" },
  { src: "/collage/board/tape-pair.webp", left: 78, top: 62, width: 8, rotate: 14, z: 9, kind: "cut" },
  { src: "/collage/board/pins.webp", left: 55, top: 2, width: 8, rotate: 4, z: 9, kind: "cut" },
  { src: "/collage/board/pins.webp", left: 84, top: 84, width: 7, rotate: -6, z: 9, kind: "cut" },
  { src: "/collage/scrap-note.webp", left: 57, top: 87, width: 11, rotate: 5, z: 8, kind: "note" },
  { src: "/collage/board/photo-court.webp", left: 84.5, top: 70, width: 14, rotate: 8, z: 6, kind: "print" },
  { src: "/collage/board/tape-pair.webp", left: 89, top: 66, width: 7, rotate: -12, z: 9, kind: "cut" },
  { src: "/collage/scrap-note.webp", left: 21, top: 84, width: 10, rotate: -4, z: 8, kind: "note" },
];

/** the four sheets, hand-placed. widths sum with the gaps rather than tiling */
const SHEETS = [
  { left: 2.5, top: 6, width: 30, tilt: -2.4, z: 20 },
  { left: 37.5, top: 1, width: 27.5, tilt: 2.1, z: 25 },
  { left: 6, top: 46, width: 29.5, tilt: 2.9, z: 22 },
  { left: 54, top: 50, width: 28.5, tilt: -3.4, z: 24 },
];

function Sheet({
  club,
  index,
  place,
  onOpen,
}: {
  club: HallwayClub;
  index: number;
  place: (typeof SHEETS)[number];
  onOpen: () => void;
}) {
  return (
    <div
      className="relative lg:absolute lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[var(--w)]"
      style={
        {
          zIndex: place.z,
          "--l": `${place.left}%`,
          "--t": `${place.top}%`,
          "--w": `${place.width}%`,
        } as React.CSSProperties
      }
    >
      <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          className="group relative block w-full text-left focus-visible:outline-none"
          style={{ transform: `rotate(${place.tilt}deg)` }}
        >
          <span aria-hidden className="absolute -left-2 -top-3 z-20 hidden h-6 w-[64px] -rotate-[38deg] opacity-95 lg:block">
            <Image src="/collage/board/tape-pair.webp" alt="" fill sizes="70px" className="object-contain" />
          </span>
          <span aria-hidden className="pin absolute right-[13%] top-0 z-20 -translate-y-1/2" />

          <span
            className="torn-soft flex h-full w-full flex-col bg-paper shadow-[var(--shadow-lift)] transition-transform duration-200 ease-[var(--ease-paper)] group-hover:-translate-y-1.5 motion-reduce:transition-none"
            style={{ padding: "22px 24px 20px" }}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">{club.tag}</span>
              <span className="tnum font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
                {String(index + 1).padStart(2, "0")} / 04
              </span>
            </span>

            <span className="mt-1.5 block font-serif text-[1.95rem] leading-[0.9] text-ink">{club.name}</span>
            <span className="scrawl mt-1 block text-[15px] leading-[1.15] text-ink">{club.tagline}</span>

            <span className="mt-3 block border-t border-ink/15 pt-2.5">
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-2">{club.cadence}</span>
              <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-3">
                {club.nextEvent ? `next · ${club.nextEvent.when}` : "no date pinned"}
              </span>
            </span>

            <span className="mt-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
                {club.status === "active" ? "running now" : "chartering"}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3 underline decoration-ink/25 underline-offset-[3px] group-hover:text-ink">
                unpin →
              </span>
            </span>
          </span>
      </button>
    </div>
  );
}

function Piece({ piece }: { piece: Piece }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${piece.kind === "note" ? "aspect-square" : "aspect-[3/2]"}`}
      style={{
        left: `${piece.left}%`,
        top: `${piece.top}%`,
        width: `${piece.width}%`,
        transform: `rotate(${piece.rotate}deg)`,
        zIndex: piece.z,
      }}
    >
      <Image
        src={piece.src}
        alt=""
        fill
        sizes="360px"
        className={
          piece.kind === "print"
            ? "object-cover shadow-[var(--shadow-scrap)]"
            : piece.kind === "note"
              ? "sticker-img object-cover shadow-[var(--shadow-scrap)]"
              : "object-contain drop-shadow-[0_8px_14px_rgba(36,26,21,0.38)]"
        }
      />
    </div>
  );
}

export function BoardCollage({
  clubs,
  onOpen,
}: {
  clubs: HallwayClub[];
  onOpen: (index: number) => void;
}) {
  return (
    <div
      className="relative mt-8 p-3 shadow-[0_50px_90px_-50px_rgba(36,26,21,0.75)] sm:p-4"
      style={{ background: "linear-gradient(160deg, #7a5836, #5c4026 58%, #6b4b2e)" }}
    >
      <div className="tex-cork relative overflow-hidden px-4 py-14 shadow-[inset_0_2px_30px_rgba(52,34,18,0.45)] sm:px-8 sm:py-16 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,246,224,0.22),transparent_60%)]" />

        {/* under-layer: struck kraft sheets and newsprint grain */}
        <div
          aria-hidden
          className="tex-kraft pointer-events-none absolute left-[5%] top-[7%] h-[86%] w-[44%] rotate-[-1.4deg] opacity-70 shadow-[var(--shadow-scrap)]"
          style={{
            clipPath:
              "polygon(0% 3%, 24% 0%, 51% 2%, 78% 0%, 100% 3%, 99% 97%, 72% 100%, 46% 98%, 21% 100%, 1% 97%)",
          }}
        />
        <div
          aria-hidden
          className="tex-kraft pointer-events-none absolute right-[4%] top-[38%] h-[46%] w-[26%] rotate-[2.2deg] opacity-55"
          style={{
            clipPath: "polygon(1% 4%, 52% 0%, 100% 3%, 98% 96%, 49% 100%, 0% 97%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "url(/collage/paper-newsprint.webp)",
            backgroundSize: "620px auto",
            mixBlendMode: "multiply",
          }}
        />

        {/* ---------------------------- the board itself (lg and up) */}
        <div className="relative hidden lg:block" style={{ aspectRatio: "1360 / 980" }}>
          {PIECES.map((piece, i) => (
            <Piece key={`${piece.src}-${i}`} piece={piece} />
          ))}
          {clubs.map((club, index) => (
            <Sheet
              key={club.slug}
              club={club}
              index={index}
              place={SHEETS[index % SHEETS.length]}
              onOpen={() => onOpen(index)}
            />
          ))}
        </div>

        {/* ---------------------------- the column (below lg) */}
        <div className="relative grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-20 lg:hidden">
          {clubs.map((club, index) => (
            <div key={club.slug} className="relative">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -right-[6%] -top-[10%] w-[46%] rotate-[6deg] aspect-[3/2]">
                  <Image
                    src={
                      ["/collage/board/photo-track.webp", "/collage/board/photo-garage.webp", "/collage/board/photo-court.webp", "/collage/board/photo-woods.webp"][
                        index % 4
                      ]
                    }
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover shadow-[var(--shadow-scrap)]"
                  />
                </div>
                <div className="absolute -bottom-[9%] -left-[7%] w-[26%] -rotate-[8deg] aspect-[3/2]">
                  <Image
                    src={
                      ["/collage/board/cut-wheel.webp", "/collage/board/cut-gear.webp", "/collage/board/cut-hoops.webp", "/collage/board/cut-mask.webp"][
                        index % 4
                      ]
                    }
                    alt=""
                    fill
                    sizes="140px"
                    className="object-contain drop-shadow-[0_6px_10px_rgba(36,26,21,0.38)]"
                  />
                </div>
              </div>
              <Sheet club={club} index={index} place={{ ...SHEETS[index % 4], tilt: [-1.8, 2, 1.4, -2.2][index % 4] }} onOpen={() => onOpen(index)} />
            </div>
          ))}
        </div>

        <div className="relative mt-14 flex flex-wrap items-center justify-between gap-3 lg:mt-10">
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
  );
}
