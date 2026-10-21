import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { FaqList } from "@/components/faq";
import { Kicker, Scrap, Stamp, Tape } from "@/components/collage/paper";
import { getClubs, getEvents, getNextEvent } from "@/lib/clubs";
import { formatMonthDay, formatTime, formatWeekday } from "@/lib/format";

export const metadata: Metadata = {
  title: "At a glance",
  description:
    "Everything the hallway says, on one page. The four Founders, Inc. clubs at Fort Mason Pier 2: status, cadence, lead, next date, the upcoming schedule, calendar and roster.",
  alternates: { canonical: "/clubs/overview" },
  openGraph: {
    title: "At a glance — Founders, Inc. Clubs",
    description:
      "Car Club, Hardware Club, Basketball Club and Paintball Club at Pier 2, Fort Mason. Status, cadence, lead and next date for each, plus the upcoming schedule.",
    url: "/clubs/overview",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "At a glance — Founders, Inc. Clubs",
    description:
      "The four Founders, Inc. clubs, their cadence and their next dates — no walking required.",
  },
};

/** Status reads as a season, not a product state. */
function statusLine(status: "active" | "coming-soon"): string {
  return status === "active" ? "Season running" : "Chartering";
}

export default function ClubsOverviewPage() {
  const now = new Date();
  const clubs = getClubs();
  const events = getEvents(now);
  const nextUp = events[0];
  const running = clubs.filter((club) => club.status === "active").length;
  const chartering = clubs.length - running;

  return (
    <main className="min-h-screen">
      {/* ---------------- masthead ---------------- */}
      <section className="mx-auto max-w-[1360px] px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <Link href="/clubs" className="inline-flex min-h-[32px] items-center hover:text-ink">
            Founders, Inc. Clubs
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">At a glance</span>
        </div>

        <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Kicker>Four clubs · Fort Mason Pier 2</Kicker>
            <h1 className="mt-4 font-serif text-[3rem] leading-[0.86] sm:text-[4.4rem]">
              Everything the hallway says,
              <br className="hidden sm:block" /> on one page.
            </h1>
            <p className="scrawl mt-5 max-w-[32ch] text-[1.45rem] leading-tight sm:text-[1.7rem]">
              no walking, no waiting, no sound on.
            </p>
          </div>

          <div className="lg:col-span-5">
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
              Four member-run clubs, one pinboard, one calendar. Everything below is the same data
              that hangs on the board at the end of the Pier 2 corridor — printed flat so you can
              read it on a phone, in a hurry, or with a screen reader.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/clubs" className="pill-btn">
                Take the walk →
              </Link>
              <Link href="/clubs/apply" className="pill-btn-secondary">
                Start a club
              </Link>
            </div>
          </div>
        </div>

        {/* ---------------- the numbers ---------------- */}
        <dl className="mt-10 grid grid-cols-2 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-4">
          <div className="bg-paper px-4 py-4 sm:px-5">
            <dt className="label">Clubs</dt>
            <dd className="mt-1 font-serif text-[2rem] leading-none tnum">{clubs.length}</dd>
          </div>
          <div className="bg-paper px-4 py-4 sm:px-5">
            <dt className="label">Running</dt>
            <dd className="mt-1 font-serif text-[2rem] leading-none tnum">
              {running}
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                +{chartering} chartering
              </span>
            </dd>
          </div>
          <div className="bg-paper px-4 py-4 sm:px-5">
            <dt className="label">Next up</dt>
            <dd className="mt-1 text-[14px] leading-snug text-ink">
              {nextUp ? (
                <span className="tnum">
                  {formatWeekday(nextUp.datetime)} {formatMonthDay(nextUp.datetime)}
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {formatTime(nextUp.datetime)}
                  </span>
                </span>
              ) : (
                <span className="text-ink-2">Nothing pinned yet</span>
              )}
            </dd>
          </div>
          <div className="bg-paper px-4 py-4 sm:px-5">
            <dt className="label">Where</dt>
            <dd className="mt-1 text-[14px] leading-snug text-ink">Pier 2 · Fort Mason</dd>
          </div>
        </dl>
      </section>

      {/* ---------------- the four clubs, flat ---------------- */}
      <section
        aria-labelledby="clubs-heading"
        className="mx-auto max-w-[1360px] px-5 pb-4 sm:px-8"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/15 pb-3">
          <h2 id="clubs-heading" className="font-serif text-[2.2rem] leading-none sm:text-[2.6rem]">
            The four clubs
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            {String(clubs.length).padStart(2, "0")} clubs · {events.length} dates on the calendar
          </span>
        </div>

        <ol className="divide-y divide-ink/15 border-b border-ink/15">
          {clubs.map((club, index) => {
            const next = getNextEvent(club.slug, now);
            return (
              <li key={club.slug} className="py-6 sm:py-7">
                <div className="grid gap-x-8 gap-y-5 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-3">
                    <span className="label tnum">
                      {String(index + 1).padStart(2, "0")} / {String(clubs.length).padStart(2, "0")} ·{" "}
                      {club.theme?.tag ?? "Campus club"}
                    </span>
                    <h3 className="mt-1.5 font-serif text-[2rem] leading-[0.9] sm:text-[2.2rem]">
                      <Link
                        href={`/clubs/${club.slug}`}
                        className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-ink/40"
                      >
                        {club.name}
                      </Link>
                    </h3>
                    <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-ink-2">
                      {club.tagline}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
                      {club.location}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:col-span-9">
                    <div>
                      <dt className="label">Status</dt>
                      <dd className="mt-1.5">
                        <span
                          className={`inline-block px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] ${
                            club.status === "active"
                              ? "bg-ink text-paper"
                              : "bg-ink/8 text-ink-2"
                          }`}
                        >
                          {statusLine(club.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="label">Cadence</dt>
                      <dd className="mt-1.5 text-[14px] leading-snug text-ink">{club.cadence}</dd>
                    </div>
                    <div>
                      <dt className="label">Lead</dt>
                      <dd className="mt-1.5 text-[14px] leading-snug text-ink">
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
                    <div>
                      <dt className="label">Next on the board</dt>
                      <dd className="mt-1.5 text-[14px] leading-snug text-ink">
                        {next ? (
                          <span className="tnum">
                            {formatWeekday(next.datetime)} {formatMonthDay(next.datetime)} ·{" "}
                            {formatTime(next.datetime)}
                            <span className="mt-1 block text-[12.5px] leading-snug text-ink-2">
                              {next.title}
                            </span>
                          </span>
                        ) : (
                          <span className="text-ink-2">No date pinned yet</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 lg:pl-[25%]">
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="inline-flex min-h-[36px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                  >
                    The {club.name.toLowerCase()} page →
                  </Link>
                  <Link
                    href={`/clubs?club=${club.slug}`}
                    className="inline-flex min-h-[36px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 underline decoration-ink/25 underline-offset-4 hover:text-ink"
                  >
                    Read it pinned in the hallway
                  </Link>
                  {next ? (
                    <a
                      href={next.rsvpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[36px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 underline decoration-ink/25 underline-offset-4 hover:text-ink"
                    >
                      RSVP on Luma ↗
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------------- next up ---------------- */}
      <section aria-labelledby="schedule-heading" className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>Next up</Kicker>
            <h2 id="schedule-heading" className="mt-3 font-serif text-[2.2rem] leading-none sm:text-[2.8rem]">
              What&apos;s on the calendar.
            </h2>
          </div>
          <Link
            href="/clubs/calendar"
            className="inline-flex min-h-[36px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
          >
            The full calendar →
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="mt-7 grid gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Scrap tone="news" rotate={-0.6} className="relative mt-7 px-6 py-7">
            <Tape className="-left-5 -top-3" rotate={-24} width={104} height={30} />
            <p className="label">Nothing pinned right now</p>
            <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-ink-2">
              No sessions are posted. Car Club dates land first on the calendar; workshop, gym and
              field days follow once chartering closes.
            </p>
            <Link href="/clubs/calendar" className="pill-btn mt-5">
              Check the calendar
            </Link>
          </Scrap>
        )}
      </section>

      {/* ---------------- calendar, roster, location ---------------- */}
      <section aria-labelledby="links-heading" className="border-y border-ink/15 bg-paperdeep/40 px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-[1360px]">
          <h2 id="links-heading" className="sr-only">
            Calendar, roster and location
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Scrap tone="cream" rotate={-0.7} className="flex h-full flex-col px-6 py-6">
              <Tape className="-right-4 -top-3" rotate={20} width={86} height={26} />
              <Kicker>Schedule</Kicker>
              <p className="scrawl mt-2 text-[1.4rem] leading-tight">dates move — subscribe.</p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                Every confirmed session, month by month, with the RSVP next to it.
              </p>
              <Link
                href="/clubs/calendar"
                className="mt-auto inline-flex min-h-[36px] items-end pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
              >
                Open the calendar →
              </Link>
            </Scrap>

            <Scrap tone="news" rotate={0.8} className="flex h-full flex-col px-6 py-6">
              <Tape className="-left-5 -top-3" rotate={-18} width={86} height={26} />
              <Kicker>The board</Kicker>
              <p className="scrawl mt-2 text-[1.4rem] leading-tight">four clubs, top to bottom.</p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                The full roster as it hangs on the wall — cadence, lead and the next date on each
                sheet.
              </p>
              <Link
                href="/clubs/roster"
                className="mt-auto inline-flex min-h-[36px] items-end pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
              >
                See the roster →
              </Link>
            </Scrap>

            <Scrap tone="kraft" rotate={-0.9} className="flex h-full flex-col px-6 py-6">
              <Tape className="-right-5 -top-3" rotate={22} width={86} height={26} />
              <Kicker>Where it happens</Kicker>
              <p className="mt-2 text-[15px] leading-snug text-ink">
                Founders, Inc. Campus
                <br />
                Pier 2, Fort Mason Center
                <br />
                San Francisco, CA 94123
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                Track days convoy from the Pier 2 lot at 7:00 AM. Workshop, gym and field days meet
                on campus unless the sheet says otherwise.
              </p>
              <a
                href="https://maps.google.com/?q=Fort+Mason+Center+Pier+2+San+Francisco"
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex min-h-[36px] items-end pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
              >
                Open in maps ↗
              </a>
            </Scrap>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section aria-labelledby="faq-heading" className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Kicker>Before you ask</Kicker>
            <h2 id="faq-heading" className="mt-3 font-serif text-[2.2rem] leading-[0.92] sm:text-[2.8rem]">
              Starting one is the only hard part.
            </h2>
            <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
              Funding, space, cadence, and what happens when nobody shows up.
            </p>
            <div className="mt-7 hidden max-w-[34ch] border-t border-ink/15 pt-4 lg:block">
              <p className="label">Already running?</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                Skip the form — the{" "}
                <Link
                  href="/clubs/roster"
                  className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  roster
                </Link>{" "}
                has every lead&apos;s next date, and the{" "}
                <Link
                  href="/clubs/calendar"
                  className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  calendar
                </Link>{" "}
                is the same one members read.
              </p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <FaqList />
          </div>
        </div>
      </section>

      {/* ---------------- apply / walk ---------------- */}
      <section className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="tex-cork relative border border-ink/15 p-3 sm:p-4">
          <div className="bg-paper/96 px-5 py-9 text-center shadow-[var(--shadow-scrap)] sm:px-10 sm:py-11">
            <Stamp>chartering open</Stamp>
            <h2 className="mt-4 font-serif text-[2.4rem] leading-[0.9] sm:text-[3.2rem]">
              Bring ten names and the fifth club goes up.
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
              A cadence, a first date, and ten people who will actually show. Everything else — the
              room, the budget, the sticker art — is ours to sort out.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/clubs/apply" className="pill-btn">
                Start a club
              </Link>
              <Link href="/clubs" className="pill-btn-secondary">
                Take the walk →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
