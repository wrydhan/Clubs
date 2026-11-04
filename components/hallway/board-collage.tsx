"use client";

/**
 * The board, as a collage.
 *
 * It is not a grid. Four club sheets are hand-placed at four different WIDTHS and
 * therefore four different heights — the type inside scales with the sheet
 * (`container-type: inline-size`, font sizes in `cqw`), so a narrow sheet is a
 * narrow sheet, not a shrunken page. Around them sit prints, cut-outs, ticket
 * stubs, a scorecard, a polaroid, a torn manual page, tape and pins, laid over
 * and under each other and over the sheet edges, so the cork reads edge to edge
 * with no bare grid-negative space.
 *
 * Every file appears exactly once. Prints are photos, cut-outs carry their own
 * alpha, ephemera is a scan with the white keyed out.
 *
 * Below `lg` the same content falls back to a single scrolling column of sheets
 * (overlapping sheets do not survive a phone), each still wearing its own props.
 *
 * Every sheet is a real button; every prop is `aria-hidden` and inert.
 */

import Image from "next/image";
import { Pin } from "@/components/collage/paper";
import Link from "next/link";
import type { HallwayClub } from "./types";

/* ------------------------------------------------------------------ the cast */

type Kind = "print" | "cut" | "eph";

type Piece = {
  src: string;
  /** box on the board, in % of the cork */
  left: number;
  top: number;
  width: number;
  rotate: number;
  z: number;
  kind: Kind;
  /** width / height of the file, so the box is the picture's box */
  ratio: number;
};

const PIECES: Piece[] = [
  // ---- prints, tucked into the seams and running off the edges
  { src: "/collage/board2/print-track2.webp", left: -6, top: 4, width: 20, rotate: -6, z: 4, kind: "print", ratio: 1.5 },
  { src: "/collage/board2/print-pitgarage.webp", left: -5, top: 33, width: 18, rotate: 5, z: 5, kind: "print", ratio: 1.5 },
  { src: "/collage/board2/print-enginebay.webp", left: -2, top: 52, width: 19, rotate: -3.5, z: 6, kind: "print", ratio: 1.5 },
  { src: "/collage/board/print-row.webp", left: 22, top: -9, width: 16, rotate: 3.5, z: 3, kind: "print", ratio: 1.5 },
  { src: "/collage/board2/print-lineup.webp", left: 70, top: -9, width: 26, rotate: 4.5, z: 4, kind: "print", ratio: 1.5 },
  { src: "/collage/board/photo-court.webp", left: 36, top: 26, width: 14, rotate: -6.5, z: 6, kind: "print", ratio: 1.5 },
  { src: "/collage/board2/print-shop.webp", left: 62, top: 13, width: 27, rotate: 5.5, z: 5, kind: "print", ratio: 1.5 },
  { src: "/collage/board2/print-court2.webp", left: 4, top: 72, width: 17, rotate: 4, z: 7, kind: "print", ratio: 1.5 },
  { src: "/collage/board/photo-woods.webp", left: 40, top: 82, width: 18, rotate: -4.5, z: 7, kind: "print", ratio: 1.5 },
  { src: "/collage/board/photo-garage.webp", left: 80, top: 60, width: 23, rotate: -7, z: 6, kind: "print", ratio: 1.5 },
  { src: "/collage/board/photo-track.webp", left: 2, top: 88, width: 19, rotate: -3, z: 8, kind: "print", ratio: 1.5 },
  { src: "/collage/board2/print-polaroid.webp", left: 34, top: 38, width: 9.5, rotate: 7.5, z: 12, kind: "print", ratio: 1 },

  // ---- ephemera: tickets, scores, notes, a napkin doodle, a strip, a poster
  { src: "/collage/board2/eph-ticket.webp", left: 5, top: 22, width: 7, rotate: -9, z: 14, kind: "eph", ratio: 0.666 },
  { src: "/collage/board2/eph-poster.webp", left: 92, top: 2, width: 12, rotate: 7, z: 16, kind: "eph", ratio: 0.677 },
  { src: "/collage/board2/eph-score.webp", left: 47, top: 30, width: 7.5, rotate: 6, z: 15, kind: "eph", ratio: 0.666 },
  { src: "/collage/board2/eph-note.webp", left: 33, top: 66, width: 8, rotate: -4, z: 16, kind: "eph", ratio: 0.673 },
  { src: "/collage/board2/eph-strip.webp", left: 87, top: 10, width: 6, rotate: 8, z: 16, kind: "eph", ratio: 0.666 },
  { src: "/collage/board2/eph-news.webp", left: 56, top: 44, width: 9, rotate: -8, z: 15, kind: "eph", ratio: 0.54 },
  { src: "/collage/board2/eph-sketch.webp", left: 44, top: 92, width: 9, rotate: 5, z: 16, kind: "eph", ratio: 1 },
  { src: "/collage/board2/eph-splat.webp", left: 24, top: 40, width: 7, rotate: -12, z: 17, kind: "eph", ratio: 0.972 },
  { src: "/collage/board2/eph-filmstrip.webp", left: 60, top: 79, width: 22, rotate: -6, z: 17, kind: "eph", ratio: 2.87 },

  // ---- cut-outs, laid along the seams so each silhouette reads
  { src: "/collage/board2/cut-wheel2.webp", left: 15, top: 47, width: 10, rotate: 8, z: 20, kind: "cut", ratio: 1 },
  { src: "/collage/board2/cut-helmet2.webp", left: 25, top: 5, width: 6.5, rotate: -9, z: 21, kind: "cut", ratio: 0.763 },
  { src: "/collage/board2/cut-ball.webp", left: 57, top: 50, width: 7.5, rotate: -6, z: 20, kind: "cut", ratio: 0.945 },
  { src: "/collage/board2/cut-mask2.webp", left: 39, top: 46, width: 9, rotate: 7, z: 20, kind: "cut", ratio: 0.978 },
  { src: "/collage/board2/cut-rim2.webp", left: 12, top: 74, width: 8.5, rotate: -7, z: 20, kind: "cut", ratio: 1.073 },
  { src: "/collage/board2/cut-shoe.webp", left: 57, top: 88, width: 13, rotate: -11, z: 21, kind: "cut", ratio: 1.574 },
  { src: "/collage/board/cut-gear.webp", left: 88, top: 44, width: 10, rotate: 9, z: 20, kind: "cut", ratio: 1.887 },
  { src: "/collage/board/cut-hoops.webp", left: 26, top: 86, width: 13, rotate: -7, z: 20, kind: "cut", ratio: 2.079 },
  { src: "/collage/board/cut-mask.webp", left: 91, top: 88, width: 11, rotate: 6, z: 20, kind: "cut", ratio: 1.708 },
  { src: "/collage/board/cut-wheel.webp", left: 53, top: 72, width: 10, rotate: -10, z: 20, kind: "cut", ratio: 1.852 },
  { src: "/collage/board/cut-creature.webp", left: 69, top: 96, width: 5.5, rotate: -8, z: 21, kind: "cut", ratio: 0.87 },

  // ---- fasteners from the paper kit, on top of everything
  { src: "/collage/board/tape-pair.webp", left: 31, top: 52, width: 8.5, rotate: -24, z: 40, kind: "cut", ratio: 1.616 },
  { src: "/collage/board/pins.webp", left: 52, top: 1.5, width: 8, rotate: 4, z: 41, kind: "cut", ratio: 2.736 },
];

/** The four sheets. Four widths, four aspects, four tilts, four depths — so
 *  each is a different shape of paper, not four copies of one page. The type is
 *  set in `cqw` and multiplied per sheet by `scale`, derived from the sheet's
 *  aspect (a taller sheet needs bigger type to fill it), so a narrow sheet is a
 *  small poster with its own type size rather than a shrunken photocopy. Two run
 *  off the frame. */
const SHEETS = [
  { left: -3, top: 2, width: 36, ar: 1.55, scale: 1.19, tilt: -2.6, z: 30 },
  { left: 34, top: 0, width: 20, ar: 1.05, scale: 1.76, tilt: 3.4, z: 26 },
  { left: 15, top: 47, width: 22, ar: 1.25, scale: 1.48, tilt: 1.6, z: 28 },
  { left: 52, top: 37, width: 45, ar: 2, scale: 0.93, tilt: -3.4, z: 24 },
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
  const sc = (v: number) => `${+(v * place.scale).toFixed(3)}cqw`;
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
        style={{
          transform: `rotate(${place.tilt}deg)`,
          containerType: "inline-size",
          aspectRatio: `${place.ar}`,
        }}
      >
        {/* tape from the paper kit, not a picture — every photograph on this
            board appears exactly once */}
        <span aria-hidden className="tape absolute -left-3 -top-2 z-20 hidden h-6 w-[68px] -rotate-[34deg] lg:block" />
        <span aria-hidden className="pin absolute right-[13%] top-0 z-20 hidden -translate-y-1/2 lg:block" />

        <span
          className="torn-soft flex h-full w-full flex-col justify-between bg-paper shadow-[var(--shadow-lift)] transition-transform duration-200 ease-[var(--ease-paper)] group-hover:-translate-y-1.5 motion-reduce:transition-none"
          style={{ padding: `${sc(5)} ${sc(5.2)} ${sc(4.4)}` }}
        >
          <span className="flex items-start justify-between gap-3">
            <span className="font-mono uppercase tracking-[0.16em] text-ink-soft" style={{ fontSize: sc(2.1) }}>
              {club.tag}
            </span>
            <span className="tnum font-mono uppercase tracking-[0.16em] text-ink-3" style={{ fontSize: sc(2.1) }}>
              {String(index + 1).padStart(2, "0")} / 04
            </span>
          </span>

          <span className="block font-serif leading-[0.9] text-ink" style={{ fontSize: sc(8.6), marginTop: sc(1.4) }}>
            {club.name}
          </span>
          <span className="scrawl block leading-[1.06] text-ink" style={{ fontSize: sc(3.8), marginTop: sc(1.4) }}>
            {club.tagline}
          </span>

          <span className="block border-t border-ink/15" style={{ marginTop: sc(2.4), paddingTop: sc(2.2) }}>
            <span className="block font-mono uppercase tracking-[0.1em] text-ink-2" style={{ fontSize: sc(2.2) }}>
              {club.cadence}
            </span>
            <span
              className="block font-mono uppercase tracking-[0.1em] text-ink-3"
              style={{ fontSize: sc(2.2), marginTop: sc(0.5) }}
            >
              {club.nextEvent ? `next · ${club.nextEvent.when}` : "no date pinned"}
            </span>
          </span>

          <span className="flex items-end justify-between gap-2" style={{ marginTop: sc(2.4) }}>
            <span className="font-mono uppercase tracking-[0.14em] text-ink-soft" style={{ fontSize: sc(2) }}>
              {club.status === "active" ? "running now" : "chartering"}
            </span>
            <span
              className="font-mono uppercase tracking-[0.14em] text-ink-3 underline decoration-ink/25 group-hover:text-ink"
              style={{ fontSize: sc(2), textUnderlineOffset: "0.35em" }}
            >
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
      className="pointer-events-none absolute"
      style={{
        left: `${piece.left}%`,
        top: `${piece.top}%`,
        width: `${piece.width}%`,
        aspectRatio: `${piece.ratio}`,
        transform: `rotate(${piece.rotate}deg)`,
        zIndex: piece.z,
      }}
    >
      <Image
        src={piece.src}
        alt=""
        fill
        sizes="(max-width: 768px) 0px, 380px"
        className={
          piece.kind === "print"
            ? "object-cover shadow-[var(--shadow-scrap)]"
            : piece.kind === "eph"
              ? "object-contain drop-shadow-[0_7px_11px_rgba(36,26,21,0.42)]"
              : "object-contain drop-shadow-[0_8px_14px_rgba(36,26,21,0.4)]"
        }
      />
    </div>
  );
}

/** Props that ride along with a sheet in the phone column, so each sheet still
 *  arrives inside a mess rather than alone on a grid. */
const MOBILE_PROPS: Piece[] = PIECES.filter((piece) => piece.z <= 21);

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
      <div className="tex-cork relative overflow-hidden px-4 py-10 shadow-[inset_0_2px_30px_rgba(52,34,18,0.45)] sm:px-8 sm:py-12 lg:px-8 lg:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,246,224,0.22),transparent_60%)]" />

        {/* under-layer: struck kraft and newsprint, so the sheets sit on paper */}
        <div
          aria-hidden
          className="tex-kraft pointer-events-none absolute left-[2%] top-[4%] h-[52%] w-[35%] rotate-[-1.6deg] opacity-65 shadow-[var(--shadow-scrap)]"
          style={{
            clipPath:
              "polygon(0% 3%, 24% 0%, 51% 2%, 78% 0%, 100% 3%, 99% 97%, 72% 100%, 46% 98%, 21% 100%, 1% 97%)",
          }}
        />
        <div
          aria-hidden
          className="tex-kraft pointer-events-none absolute right-[1%] top-[48%] h-[46%] w-[28%] rotate-[1.8deg] opacity-50"
          style={{ clipPath: "polygon(1% 4%, 52% 0%, 100% 3%, 98% 96%, 49% 100%, 0% 97%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "url(/collage/paper-newsprint.webp)",
            backgroundSize: "620px auto",
            mixBlendMode: "multiply",
          }}
        />

        {/* the cork labels, torn from the seam rather than a tidy row of pills */}
        <div className="pointer-events-none absolute inset-x-0 top-[1.2%] z-[45] flex items-start justify-between px-[2.2%]">
          <span className="rotate-[-1.2deg] bg-paper px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2 shadow-[var(--shadow-scrap)]">
            founders, inc. · pier 2
          </span>
          <span className="rotate-[1.6deg] bg-paper/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft shadow-[var(--shadow-scrap)]">
            the four clubs
          </span>
        </div>

        {/* torn blank stock and tape, cut from the paper kit rather than from
            pictures — it fills the last seams without repeating a photograph */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          <span className="tex-kraft absolute left-[56%] top-[1%] h-[17%] w-[13%] rotate-[3deg] opacity-90 shadow-[var(--shadow-scrap)]" style={{ clipPath: "polygon(0% 4%, 26% 0%, 55% 3%, 82% 0%, 100% 4%, 98% 96%, 70% 100%, 42% 97%, 15% 100%, 1% 96%)" }} />
          <span className="tex-news absolute left-[86%] top-[46%] h-[16%] w-[14%] -rotate-[4deg] opacity-95 shadow-[var(--shadow-scrap)]" style={{ clipPath: "polygon(1% 3%, 48% 0%, 100% 2%, 99% 97%, 52% 100%, 0% 98%)" }} />
          <span className="bg-paper absolute left-[1%] top-[70%] h-[15%] w-[11%] rotate-[-7deg] opacity-95 shadow-[var(--shadow-scrap)]" style={{ clipPath: "polygon(0% 3%, 52% 0%, 100% 4%, 97% 100%, 45% 97%, 0% 100%)" }} />
          <span className="tex-kraft absolute left-[36%] top-[78%] h-[13%] w-[10%] -rotate-[3deg] opacity-85 shadow-[var(--shadow-scrap)]" style={{ clipPath: "polygon(2% 0%, 100% 3%, 98% 100%, 0% 96%)" }} />
          <span className="tape absolute left-[52%] top-[26%] h-6 w-[86px] -rotate-[18deg]" />
          <span className="tape absolute left-[8%] top-[58%] h-6 w-[78px] rotate-[12deg]" />
          <span className="tape absolute left-[76%] top-[88%] h-6 w-[82px] rotate-[6deg]" />
          <span className="tape absolute left-[30%] top-[97%] h-5 w-[74px] -rotate-[8deg]" />
          <span className="stamp absolute left-[64%] top-[57%] text-[11px]">pier 2 · members only</span>
          <span className="tex-news absolute left-[2%] top-[46%] h-[14%] w-[12%] rotate-[6deg] opacity-95 shadow-[var(--shadow-scrap)]" style={{ clipPath: "polygon(1% 4%, 50% 0%, 100% 3%, 98% 97%, 48% 100%, 0% 96%)" }} />
          <span className="tex-kraft absolute left-[31%] top-[34%] h-[11%] w-[9%] -rotate-[9deg] opacity-90 shadow-[var(--shadow-scrap)]" style={{ clipPath: "polygon(0% 5%, 55% 0%, 100% 4%, 97% 100%, 42% 97%, 1% 100%)" }} />
          <span className="tape absolute left-[34%] top-[43%] h-5 w-[70px] rotate-[24deg]" />
        </div>

        {/* ---------------------------- the board itself (lg and up) */}
        <div className="relative hidden lg:block" style={{ aspectRatio: "1360 / 1060" }}>
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
          {clubs.map((club, index) => {
            const a = MOBILE_PROPS[(index * 5) % MOBILE_PROPS.length];
            const b = MOBILE_PROPS[(index * 5 + 2) % MOBILE_PROPS.length];
            const c = MOBILE_PROPS[(index * 5 + 3) % MOBILE_PROPS.length];
            return (
              <div key={club.slug} className="relative">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <div className="absolute -right-[7%] -top-[11%] aspect-[3/2] w-[48%] rotate-[6deg]">
                    <Image src={a.src} alt="" fill sizes="220px" className="object-cover shadow-[var(--shadow-scrap)]" />
                  </div>
                  <div className="absolute -bottom-[9%] -left-[8%] aspect-[3/2] w-[28%] -rotate-[8deg]">
                    <Image
                      src={b.src}
                      alt=""
                      fill
                      sizes="150px"
                      className="object-contain drop-shadow-[0_6px_10px_rgba(36,26,21,0.38)]"
                    />
                  </div>
                  <div className="absolute right-[4%] top-[38%] aspect-square w-[22%] rotate-[9deg]">
                    <Image
                      src={c.src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-contain drop-shadow-[0_6px_10px_rgba(36,26,21,0.38)]"
                    />
                  </div>
                </div>
                <Sheet
                  club={club}
                  index={index}
                  place={{ ...SHEETS[index % 4], tilt: [-1.8, 2, 1.4, -2.2][index % 4] }}
                  onOpen={() => onOpen(index)}
                />
              </div>
            );
          })}
        </div>

        {/* the controls sit on their own scrap of paper, so the mono links are
            not read off noisy cork on a phone */}
        <div className="torn-soft relative mt-14 flex flex-wrap items-center justify-between gap-3 bg-paper px-4 py-4 shadow-[var(--shadow-scrap)] sm:px-6 lg:mt-8">
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
