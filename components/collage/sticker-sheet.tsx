import Link from "next/link";
import { Scrap, Tape } from "@/components/collage/paper";
import { stickerFor } from "@/lib/collage";
import { getNextEvent, type Club } from "@/lib/clubs";
import { formatMonthDay } from "@/lib/format";

const TILT = [-1.6, 1.1, -0.9, 1.8, -1.2, 0.7];

/** The roster, as a sheet of die-cut stickers taped to the board. */
export function StickerSheet({ clubs, now }: { clubs: Club[]; now: Date }) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club, index) => {
        const next = getNextEvent(club.slug, now);
        const sticker = stickerFor(club.slug);
        const tilt = TILT[index % TILT.length];
        return (
          <li key={club.slug} className="group relative">
            <Link href={`/clubs/${club.slug}`} className="block focus-visible:outline-none">
              <Scrap
                tone={index % 2 === 0 ? "cream" : "news"}
                rotate={tilt}
                className="relative flex h-full flex-col px-5 pb-5 pt-4 transition-transform duration-300 ease-[var(--ease-paper)] group-hover:-translate-y-1.5 group-hover:rotate-0 group-focus-visible:-translate-y-1.5 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-ink"
              >
                <Tape
                  className={index % 2 === 0 ? "-left-5 -top-3" : "-right-5 -top-3"}
                  rotate={index % 2 === 0 ? -32 : 28}
                  width={104}
                  height={32}
                />

                <div className="flex items-start justify-between gap-3">
                  <span className="label">{club.theme?.tag ?? "Campus club"}</span>
                  <span className="label tnum text-ink-3">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="relative mt-3 flex h-[190px] items-center justify-center">
                  {sticker ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sticker}
                      alt={`${club.name} sticker`}
                      width={320}
                      height={320}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="sticker-img h-full w-auto max-w-full object-contain transition-transform duration-500 ease-[var(--ease-paper)] group-hover:rotate-[-2deg] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="scrawl text-3xl">{club.name}</span>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-serif text-[2rem] leading-none">{club.name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                    {club.tagline}
                  </p>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/10 pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                  <div>
                    <dt>Cadence</dt>
                    <dd className="mt-1 normal-case tracking-normal text-[12px] text-ink">
                      {club.cadence}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt>Next</dt>
                    <dd className="mt-1 truncate normal-case tracking-normal text-[12px] text-ink">
                      {next ? formatMonthDay(next.datetime) : "TBA"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {club.status === "active" ? "Running" : "Chartering"}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink underline decoration-ink/30 underline-offset-4">
                    Open the club →
                  </span>
                </div>
              </Scrap>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
