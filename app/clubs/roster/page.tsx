import type { Metadata } from "next";
import Link from "next/link";
import { Pin, Scrap, Tape, Stamp, Kicker, Sticker } from "@/components/collage/paper";
import { stickerFor } from "@/lib/collage";
import { getClubs, getNextEvent } from "@/lib/clubs";
import { formatMonthDay, formatTime, formatWeekday } from "@/lib/format";

export const metadata: Metadata = {
  title: "The four clubs — Founders, Inc. Clubs",
  description:
    "Car Club, Hardware Club, Basketball Club and Paintball Club at Founders, Inc. Fort Mason Pier 2. Cadence, where each one meets, the next date pinned and who runs it.",
  alternates: { canonical: "/clubs/roster" },
};

/** Editorial stagger rather than a uniform card row: two wide sheets, two
    narrow ones, each on its own tilt, so the board reads like a board. */
const LAYOUT = [
  { span: "lg:col-span-7", tilt: -0.9, tone: "cream" as const, lift: true },
  { span: "lg:col-span-5 lg:mt-14", tilt: 1.3, tone: "news" as const, lift: false },
  { span: "lg:col-span-5 lg:mt-6", tilt: -1.2, tone: "kraft" as const, lift: false },
  { span: "lg:col-span-7 lg:-mt-4", tilt: 0.8, tone: "cream" as const, lift: true },
];

const TAPE = [
  { className: "-left-7 -top-4", rotate: -26, width: 132, height: 38 },
  { className: "-right-6 -top-3", rotate: 22, width: 108, height: 32 },
  { className: "-left-6 -top-3", rotate: -18, width: 104, height: 30 },
  { className: "-right-7 -top-4", rotate: 16, width: 126, height: 36 },
];

export default function RosterPage() {
  const now = new Date();
  const clubs = getClubs();

  return (
    <main className="min-h-screen">
      {/* ---------------- head ---------------- */}
      <section className="mx-auto max-w-[1360px] px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <Link href="/clubs/wall" className="inline-flex min-h-[32px] items-center hover:text-ink">
            The wall
          </Link>
          <span>/</span>
          <span className="text-ink">The four clubs</span>
        </div>

        <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Kicker>Four clubs · Fort Mason Pier 2</Kicker>
            <h1 className="mt-4 font-serif text-[3.2rem] leading-[0.84] sm:text-[4.8rem]">
              The four clubs,
              <br />
              top to bottom.
            </h1>
            <p className="scrawl mt-5 max-w-[34ch] text-[1.45rem] leading-tight sm:text-[1.7rem]">
              every one of them run by a member, not a marketing team.
            </p>
          </div>

          <div className="lg:col-span-5">
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
              Two are running, two are still collecting charter signatures. Cadence, meeting spot and
              the next date are printed on each sheet below — pull one off the board, or walk the
              hallway and read them where they are actually pinned.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/clubs" className="pill-btn">
                Walk the hallway →
              </Link>
              <Link href="/clubs/apply" className="pill-btn-secondary">
                Start a fifth
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- the board ---------------- */}
      <section className="tex-cork border-y border-ink/15 px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <span className="bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2 shadow-[var(--shadow-scrap)]">
              the notice board
            </span>
            <span className="bg-paper/92 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 shadow-[var(--shadow-scrap)]">
              four flyers · four clubs
            </span>
          </div>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
            {clubs.map((club, index) => {
              const layout = LAYOUT[index % LAYOUT.length];
              const tape = TAPE[index % TAPE.length];
              const next = getNextEvent(club.slug, now);
              const sticker = stickerFor(club.slug);

              return (
                <li key={club.slug} className={`relative ${layout.span}`}>
                  <Scrap
                    tone={layout.tone}
                    rotate={layout.tilt}
                    lift={layout.lift}
                    className="flex h-full flex-col px-5 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7"
                  >
                    <Tape
                      className={tape.className}
                      rotate={tape.rotate}
                      width={tape.width}
                      height={tape.height}
                    />
                    <Pin className="left-1/2 top-1.5 -translate-x-1/2 opacity-0" />

                    <div className="flex items-start justify-between gap-4">
                      <span className="label">{club.theme?.tag ?? "Campus club"}</span>
                      <span className="label tnum text-ink-3">
                        {String(index + 1).padStart(2, "0")} / 04
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                      <div className="min-w-[12ch] flex-1">
                        <h2 className="font-serif text-[2.4rem] leading-[0.86] sm:text-[2.9rem]">
                          {club.name}
                        </h2>
                        <p className="scrawl mt-2 max-w-[30ch] text-[1.2rem] leading-tight">
                          {club.tagline}
                        </p>
                      </div>
                      {sticker ? (
                        <Sticker
                          src={sticker}
                          alt={`${club.name} sticker`}
                          size={112}
                          rotate={index % 2 === 0 ? -5 : 4}
                          className="hidden shrink-0 sm:block"
                        />
                      ) : null}
                    </div>

                    <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink/20 pt-4">
                      <div>
                        <dt className="label">Cadence</dt>
                        <dd className="mt-1 text-[14px] leading-snug text-ink">{club.cadence}</dd>
                      </div>
                      <div>
                        <dt className="label">Location</dt>
                        <dd className="mt-1 text-[14px] leading-snug text-ink">{club.location}</dd>
                      </div>
                      <div>
                        <dt className="label">Next on the board</dt>
                        <dd className="mt-1 text-[14px] leading-snug text-ink">
                          {next ? (
                            <span className="tnum">
                              {formatWeekday(next.datetime)} {formatMonthDay(next.datetime)} ·{" "}
                              {formatTime(next.datetime)}
                              <span className="block text-[12.5px] text-ink-2">{next.title}</span>
                            </span>
                          ) : (
                            <span className="text-ink-2">No date pinned yet</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="label">Lead</dt>
                        <dd className="mt-1 text-[14px] leading-snug text-ink">
                          {club.lead ? (
                            <>
                              {club.lead.name}
                              <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">
                                {club.lead.role}
                              </span>
                            </>
                          ) : (
                            <span className="text-ink-2">Not named yet</span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                      <Stamp>{club.status === "active" ? "season running" : "chartering"}</Stamp>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Link
                          href={`/clubs?club=${club.slug}`}
                          className="inline-flex min-h-[36px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 underline decoration-ink/30 underline-offset-4 hover:text-ink"
                        >
                          Unpin it in the hallway
                        </Link>
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="inline-flex min-h-[36px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                        >
                          The club page →
                        </Link>
                      </div>
                    </div>
                  </Scrap>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------- tail ---------------- */}
      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <Kicker>Not on this board</Kicker>
            <h2 className="mt-3 font-serif text-[2.6rem] leading-[0.9] sm:text-[3.4rem]">
              Bring ten names and the fifth club goes up.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
              Charters need a cadence, a first date and ten people who will actually show. Everything
              else — the room, the budget, the sticker art — is ours to sort out.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
            <Link href="/clubs/apply" className="pill-btn">
              Start a club
            </Link>
            <Link href="/clubs" className="pill-btn-secondary">
              Back to the wall
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
