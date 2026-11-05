import type { ReactElement } from "react";
import type { HallwayClub } from "@/components/hallway/types";

/**
 * One sheet of paper per club, and no two sheets are the same page.
 *
 * Waleed's note: the four clubs were coming out as one design at four sizes.
 * So each club now gets its own printed artefact, drawn from what that club
 * actually is:
 *
 *   cars        a timing sheet — run groups, lap times, deltas, a scrutineer's stamp
 *   hardware    a job ticket — work order, part no., material, tolerance, checklist
 *   basketball  a scoresheet — four quarters, two teams, running total, fouls
 *   paintball   a field-day map — a hand-drawn course, grid refs, insert point, legend
 *
 * Everything is token-only: paper, ink, ink-soft, ink-3. No club hue is used,
 * because colour is never the hierarchy here — the structure of each form does
 * that job. Torn edges and the paper texture come from the wrapper, which each
 * host supplies, so the sheet still tears the same way on the flat board, the
 * 3D board and the phone column.
 *
 * `sc` is the host's type-scale function (cqw on the flat board, plane units in
 * the 3D walk), so the same design runs at any sheet size. `compact` drops the
 * second-tier rows on the narrow sheets, where four rows of 5px mono is noise.
 */

type Scale = (v: number) => string;

type PosterProps = {
  club: HallwayClub;
  index: number;
  sc: Scale;
  compact: boolean;
};

function Rule({ opacity = 0.16 }: { opacity?: number }) {
  return <span aria-hidden className="block w-full" style={{ height: 1, background: `rgba(36,26,21,${opacity})` }} />;
}

/* -------------------------------------------------------------- cars */

function TimingSheet({ club, index, sc, compact }: PosterProps) {
  const rows = compact
    ? [
        ["A", "07", "1:42.318", "—"],
        ["A", "12", "1:44.902", "+2.584"],
        ["B", "03", "1:49.117", "+6.799"],
      ]
    : [
        ["A", "07", "1:42.318", "—"],
        ["A", "12", "1:44.902", "+2.584"],
        ["B", "03", "1:49.117", "+6.799"],
        ["B", "21", "1:51.640", "+9.322"],
        ["C", "05", "2:00.094", "+17.776"],
      ];
  return (
    <span className="flex h-full w-full flex-col" style={{ padding: `${sc(4)} ${sc(4.4)} ${sc(3.4)}` }}>
      <span className="flex items-baseline justify-between" style={{ gap: sc(2) }}>
        <span className="font-mono uppercase text-ink-soft" style={{ fontSize: sc(1.9), letterSpacing: "0.16em" }}>
          timing sheet · sonoma
        </span>
        <span className="tnum font-mono uppercase text-ink-3" style={{ fontSize: sc(1.9), letterSpacing: "0.16em" }}>
          {String(index + 1).padStart(2, "0")}/04
        </span>
      </span>

      <span className="block font-serif leading-[0.88] text-ink" style={{ fontSize: sc(8.4), marginTop: sc(2.1) }}>
        {club.name}
      </span>
      <span className="scrawl block leading-[1.08]" style={{ fontSize: sc(3.2), marginTop: sc(1.2) }}>
        {club.tagline}
      </span>

      {/* run groups */}
      <span className="mt-auto block" style={{ marginTop: sc(2.6) }}>
        <span
          className="flex items-center justify-between font-mono uppercase text-ink-3"
          style={{ fontSize: sc(1.7), letterSpacing: "0.14em", paddingBottom: sc(0.9) }}
        >
          <span>grp · car</span>
          <span>lap</span>
          <span>Δ</span>
        </span>
        <Rule />
        {rows.map(([grp, car, lap, delta]) => (
          <span key={car} className="block">
            <span
              className="tnum flex items-center justify-between font-mono uppercase text-ink"
              style={{ fontSize: sc(2), letterSpacing: "0.08em", paddingBlock: sc(0.75) }}
            >
              <span className="text-ink-2">
                {grp} · {car}
              </span>
              <span>{lap}</span>
              <span className="text-ink-3">{delta}</span>
            </span>
            <Rule opacity={0.1} />
          </span>
        ))}
      </span>

      <span className="flex items-end justify-between" style={{ gap: sc(2), marginTop: sc(2.4) }}>
        <span className="block">
          <span className="block font-mono uppercase text-ink-2" style={{ fontSize: sc(1.8), letterSpacing: "0.1em" }}>
            {club.cadence}
          </span>
          <span
            className="block font-mono uppercase text-ink-3"
            style={{ fontSize: sc(1.8), letterSpacing: "0.1em", marginTop: sc(0.5) }}
          >
            {club.nextEvent ? `next · ${club.nextEvent.when}` : "no date pinned"}
          </span>
        </span>
        {compact ? null : (
          <span className="stamp shrink-0" style={{ fontSize: sc(1.6) }}>
            scrutineered
          </span>
        )}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------- hardware */

function JobTicket({ club, index, sc, compact }: PosterProps) {
  const fields = compact
    ? [
        ["part", "handle block"],
        ["matl", "6061-t6"],
        ["qty", "04"],
      ]
    : [
        ["part", "handle block"],
        ["matl", "6061-t6"],
        ["qty", "04"],
        ["tol", "± 0.05 mm"],
        ["fin", "bead blast"],
      ];
  return (
    <span className="relative flex h-full w-full flex-col" style={{ padding: `${sc(4)} ${sc(4.4)} ${sc(3.4)} ${sc(7)}` }}>
      {/* punch holes down the spine — it is a torn-off ticket, not a page */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 block w-full">
        {[0.2, 0.5, 0.8].map((t) => (
          <span
            key={t}
            className="absolute rounded-full"
            style={{
              left: sc(2.4),
              top: `${t * 100}%`,
              width: sc(2.1),
              height: sc(2.1),
              transform: "translateY(-50%)",
              boxShadow: "inset 0 0 0 1px rgba(36,26,21,0.28)",
              background: "rgba(36,26,21,0.05)",
            }}
          />
        ))}
      </span>

      <span className="flex items-baseline justify-between" style={{ gap: sc(2), paddingLeft: sc(2) }}>
        <span className="font-mono uppercase text-ink-soft" style={{ fontSize: sc(1.9), letterSpacing: "0.18em" }}>
          job ticket
        </span>
        <span className="tnum font-mono uppercase text-ink-3" style={{ fontSize: sc(1.9), letterSpacing: "0.14em" }}>
          wo-14{String(index + 1).padStart(2, "0")}
        </span>
      </span>

      <span className="block font-serif leading-[0.9] text-ink" style={{ fontSize: sc(7.6), marginTop: sc(2.6), paddingLeft: sc(2) }}>
        {club.name}
      </span>

      <span className="block" style={{ marginTop: sc(2.4), paddingLeft: sc(2) }}>
        {fields.map(([k, v]) => (
          <span key={k} className="flex items-baseline" style={{ gap: sc(1.4), paddingBlock: sc(0.55) }}>
            <span className="font-mono uppercase text-ink-3" style={{ fontSize: sc(1.75), letterSpacing: "0.12em" }}>
              {k}
            </span>
            <span
              aria-hidden
              className="min-w-0 flex-1"
              style={{ borderBottom: "1px dotted rgba(36,26,21,0.3)", transform: "translateY(-2px)" }}
            />
            <span className="font-mono uppercase text-ink" style={{ fontSize: sc(1.9), letterSpacing: "0.06em" }}>
              {v}
            </span>
          </span>
        ))}
      </span>

      <span className="flex flex-wrap items-center text-ink-2" style={{ gap: sc(2.2), marginTop: sc(2.2), paddingLeft: sc(2) }}>
        {["turn", "mill", "anodize"].map((step) => (
          <span
            key={step}
            className="inline-flex items-center font-mono uppercase"
            style={{ gap: sc(0.8), fontSize: sc(1.75), letterSpacing: "0.1em" }}
          >
            <span aria-hidden style={{ width: sc(1.5), height: sc(1.5), boxShadow: "inset 0 0 0 1px rgba(36,26,21,0.45)" }} />
            {step}
          </span>
        ))}
      </span>

      <span className="scrawl mt-auto block leading-[1.06]" style={{ fontSize: sc(2.9), marginTop: sc(2.4), paddingLeft: sc(2) }}>
        {club.tagline}
      </span>

      <span
        className="flex items-end justify-between font-mono uppercase"
        style={{ gap: sc(2), marginTop: sc(1.8), paddingLeft: sc(2) }}
      >
        <span className="text-ink-2" style={{ fontSize: sc(1.75), letterSpacing: "0.1em" }}>
          {club.cadence}
        </span>
        <span className="text-ink-3" style={{ fontSize: sc(1.75), letterSpacing: "0.1em" }}>
          {club.status === "active" ? "bench open" : "chartering"}
        </span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------- basketball */

function Scoresheet({ club, index, sc, compact }: PosterProps) {
  const quarters = compact ? ["1", "2", "4"] : ["1", "2", "3", "4"];
  const sides: [string, string[], string][] = compact
    ? [
        ["home", ["18", "21", "24"], "63"],
        ["away", ["16", "19", "22"], "57"],
      ]
    : [
        ["home", ["18", "21", "19", "24"], "82"],
        ["away", ["16", "19", "25", "22"], "82"],
      ];
  return (
    <span className="flex h-full w-full flex-col" style={{ padding: `${sc(4)} ${sc(4.4)} ${sc(3.4)}` }}>
      <span className="flex items-baseline justify-between" style={{ gap: sc(2) }}>
        <span className="font-mono uppercase text-ink-soft" style={{ fontSize: sc(1.9), letterSpacing: "0.16em" }}>
          scoresheet
        </span>
        <span className="tnum font-mono uppercase text-ink-3" style={{ fontSize: sc(1.9), letterSpacing: "0.16em" }}>
          {String(index + 1).padStart(2, "0")}/04
        </span>
      </span>

      {/* the grid: quarters across, two sides down */}
      <span className="mt-auto block" style={{ marginTop: sc(2.6) }}>
        <span className="flex font-mono uppercase text-ink-3" style={{ fontSize: sc(1.7), letterSpacing: "0.12em", gap: sc(1) }}>
          <span className="flex-1" />
          {quarters.map((q) => (
            <span key={q} className="tnum text-right" style={{ width: sc(4) }}>
              q{q}
            </span>
          ))}
          <span className="tnum text-right" style={{ width: sc(4.6) }}>
            t
          </span>
        </span>
        <Rule />
        {sides.map(([side, cells, total]) => (
          <span key={side} className="block">
            <span
              className="flex items-baseline font-mono uppercase text-ink"
              style={{ fontSize: sc(1.9), letterSpacing: "0.1em", gap: sc(1), paddingBlock: sc(0.8) }}
            >
              <span className="flex-1 text-ink-2">{side}</span>
              {cells.map((c, i) => (
                <span key={i} className="tnum text-right">
                  {c}
                </span>
              ))}
              <span className="tnum text-right font-bold" style={{ width: sc(4.6) }}>
                {total}
              </span>
            </span>
            <Rule opacity={0.1} />
          </span>
        ))}
      </span>

      <span className="block font-serif leading-[0.88] text-ink" style={{ fontSize: sc(8), marginTop: sc(2.6) }}>
        {club.name}
      </span>
      <span className="scrawl block leading-[1.08]" style={{ fontSize: sc(3), marginTop: sc(1.2) }}>
        {club.tagline}
      </span>

      <span className="flex items-end justify-between font-mono uppercase" style={{ gap: sc(2), marginTop: sc(2.2) }}>
        <span className="block">
          <span className="block text-ink-2" style={{ fontSize: sc(1.75), letterSpacing: "0.1em" }}>
            {club.cadence}
          </span>
          <span className="block text-ink-3" style={{ fontSize: sc(1.75), letterSpacing: "0.1em", marginTop: sc(0.5) }}>
            {club.nextEvent ? `next · ${club.nextEvent.when}` : "no date pinned"}
          </span>
        </span>
        <span className="text-ink-3" style={{ fontSize: sc(1.75), letterSpacing: "0.1em" }}>
          no refs
        </span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------- paintball */

function FieldMap({ club, index, sc, compact }: PosterProps) {
  return (
    <span className="flex h-full w-full flex-col" style={{ padding: `${sc(4)} ${sc(4.4)} ${sc(3.4)}` }}>
      <span className="flex items-baseline justify-between" style={{ gap: sc(2) }}>
        <span className="font-mono uppercase text-ink-soft" style={{ fontSize: sc(1.9), letterSpacing: "0.16em" }}>
          field day · map
        </span>
        <span className="tnum font-mono uppercase text-ink-3" style={{ fontSize: sc(1.9), letterSpacing: "0.16em" }}>
          {String(index + 1).padStart(2, "0")}/04
        </span>
      </span>

      <span className="block font-serif leading-[0.88] text-ink" style={{ fontSize: sc(8.4), marginTop: sc(2) }}>
        {club.name}
      </span>

      {/* the course, sketched in ink: zones, a river gap, the insert path */}
      <span className="relative block flex-1" style={{ marginTop: sc(1.8), minHeight: sc(26) }}>
        <svg
          viewBox="0 0 200 130"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full text-ink"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path
            d="M8 22 L60 12 L96 26 L150 14 L192 26 L186 74 L150 96 L104 84 L58 102 L14 90 Z"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M8 22 L60 12 L96 26 L150 14 L192 26" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.5" />
          <path
            d="M30 60 C52 46, 78 68, 104 54 S150 44, 172 62"
            strokeWidth="1.2"
            strokeDasharray="1 3"
            opacity="0.75"
          />
          <path d="M104 84 L112 108 L142 118" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          {/* structures */}
          <rect x="44" y="34" width="20" height="14" strokeWidth="1.1" opacity="0.8" />
          <rect x="120" y="30" width="14" height="22" strokeWidth="1.1" opacity="0.8" />
          <circle cx="150" cy="70" r="8" strokeWidth="1.1" opacity="0.8" />
          <path d="M70 74 l6 -10 l6 10 z" strokeWidth="1.1" opacity="0.8" />
          {/* insert point and objectives */}
          <path d="M16 116 l7 -12 l7 12 z" fill="currentColor" stroke="none" />
          <circle cx="112" cy="108" r="3.4" fill="currentColor" stroke="none" />
          <circle cx="142" cy="118" r="3.4" fill="currentColor" stroke="none" />
          {/* grid ticks */}
          <path d="M8 8 v4 M60 8 v4 M112 8 v4 M164 8 v4" strokeWidth="0.9" opacity="0.5" />
          {/* north */}
          <path d="M186 112 l0 -16 M182 104 l4 -8 l4 8" strokeWidth="1" opacity="0.7" />
        </svg>
      </span>

      <span className="scrawl block leading-[1.06]" style={{ fontSize: sc(2.9), marginTop: sc(1.8) }}>
        {club.tagline}
      </span>

      <span className="flex items-end justify-between font-mono uppercase" style={{ gap: sc(2), marginTop: sc(1.8) }}>
        <span className="text-ink-2" style={{ fontSize: sc(1.75), letterSpacing: "0.1em" }}>
          {club.cadence}
        </span>
        <span className="text-ink-3" style={{ fontSize: sc(1.75), letterSpacing: "0.1em" }}>
          {compact ? "woodsball" : "rentals covered"}
        </span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------- the switch */

const BY_SLUG: Record<string, (props: PosterProps) => ReactElement> = {
  cars: TimingSheet,
  hardware: JobTicket,
  basketball: Scoresheet,
  paintball: FieldMap,
};

/** A club with no bespoke artefact yet still gets the timing-sheet bones, so a
    fifth club is never a blank sheet of paper. */
export function ClubPoster(props: PosterProps) {
  const Layout = BY_SLUG[props.club.slug] ?? TimingSheet;
  return <Layout {...props} />;
}
