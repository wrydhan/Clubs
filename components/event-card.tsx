import Link from "next/link";
import { Scrap, Tape } from "@/components/collage/paper";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

/** A session as a typewritten slip pinned next to the club. */
export function EventCard({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <Scrap tone="news" rotate={-0.6} className="relative px-5 py-6 sm:px-8 sm:py-8">
      <Tape className="-left-5 -top-3" rotate={-24} width={104} height={30} />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0 sm:w-24">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
            {formatWeekday(event.datetime)}
          </span>
          <span className="my-1 block font-serif text-[2.6rem] leading-none">
            {formatDay(event.datetime)}
          </span>
          <span className="block font-mono text-[11px] tnum text-ink/65">
            {formatTime(event.datetime)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/55">
            {club ? (
              <Link
                href={`/clubs/${club.slug}`}
                className="bg-ink/8 px-2.5 py-1 text-ink/80 hover:bg-ink hover:text-paper"
              >
                {club.name}
              </Link>
            ) : null}
            <span>·</span>
            <span>{event.location.split("·")[0].trim()}</span>
            {event.capacity ? (
              <>
                <span>·</span>
                <span>{event.capacity} cap</span>
              </>
            ) : null}
          </div>

          <h3 className="mt-3 font-serif text-[1.9rem] leading-[0.95] sm:text-[2.3rem]">
            {event.title}
          </h3>
          <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-ink/75">
            {event.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/50">
              {event.location}
            </span>
            <a href={event.rsvpUrl} target="_blank" rel="noreferrer" className="pill-btn text-[12px]">
              RSVP on Luma ↗
            </a>
          </div>
        </div>
      </div>
      <p className="sr-only">{formatFullDate(event.datetime)}</p>
    </Scrap>
  );
}
