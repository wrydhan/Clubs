import Link from "next/link";
import { Scrap, Stamp, Tape, Pin } from "@/components/collage/paper";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

/** The next session, as a typewritten notice taped to the board with the date circled. */
export function PinnedNotice({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <Scrap tone="news" rotate={-0.8} className="relative px-6 py-8 sm:px-10 sm:py-10">
      <Tape className="-left-6 -top-5" rotate={-28} width={132} height={38} />
      <Tape className="-right-5 top-1" rotate={22} width={104} height={30} />
      <Pin className="-top-1.5 left-1/2 -translate-x-1/2" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
          Pinned to the board · next session
        </span>
        <Stamp>{event.capacity ? `${event.capacity} driver cap` : "Open field"}</Stamp>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* date, circled by hand */}
        <div className="relative w-fit shrink-0 px-3 py-2">
          <svg
            aria-hidden
            viewBox="0 0 160 120"
            className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)]"
            fill="none"
          >
            <ellipse
              cx="80"
              cy="60"
              rx="72"
              ry="52"
              stroke="#c0432a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="300 12"
              transform="rotate(-6 80 60)"
              opacity="0.85"
            />
          </svg>
          <div className="relative text-center">
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
              {formatWeekday(event.datetime)}
            </span>
            <span className="block font-serif text-[3.4rem] leading-none">
              {formatDay(event.datetime)}
            </span>
            <span className="block font-mono text-[11px] tnum text-ink-2">
              {formatTime(event.datetime)}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-serif text-[2rem] leading-[0.95] sm:text-[2.6rem]">
            {event.title}
          </h3>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2">
            {event.location}
            {club ? ` · ${club.name}` : ""}
          </p>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-2">
            {event.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href={event.rsvpUrl} target="_blank" rel="noreferrer" className="pill-btn">
              RSVP on Luma ↗
            </a>
            {club ? (
              <Link href={`/clubs/${club.slug}`} className="pill-btn-secondary">
                {club.name} details
              </Link>
            ) : null}
            <Link href="/clubs/calendar" className="pill-btn-secondary">
              Full calendar
            </Link>
          </div>
        </div>
      </div>

      <p className="sr-only">{formatFullDate(event.datetime)}</p>
    </Scrap>
  );
}
