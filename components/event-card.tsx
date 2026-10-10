import Link from "next/link";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

export function EventCard({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <article className="group finc-card overflow-hidden transition-all duration-200 hover:bg-[#EBEBEB]">
      <div className="flex flex-col sm:flex-row sm:items-stretch p-6 sm:p-8 gap-6 sm:gap-8">
        {/* Date block */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center p-5 bg-white rounded-[12px] sm:w-32 shrink-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-black/40">
            {formatWeekday(event.datetime)}
          </span>
          <span className="font-serif text-4xl sm:text-5xl leading-none text-black my-1">
            {formatDay(event.datetime)}
          </span>
          <span className="font-mono text-xs text-black/50 tnum">
            {formatTime(event.datetime)}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {club ? (
                <Link
                  href={`/clubs/${club.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-tight bg-black/5 text-black hover:bg-black hover:text-white transition-colors"
                >
                  {club.name}
                </Link>
              ) : null}
              <span className="font-mono text-[11px] text-black/40">/</span>
              <span className="font-mono text-xs text-black/60">
                {event.location.split("·")[0].trim()}
              </span>
              {event.capacity ? (
                <>
                  <span className="font-mono text-[11px] text-black/40">/</span>
                  <span className="font-mono text-xs text-black/40">
                    {event.capacity} Driver Cap
                  </span>
                </>
              ) : null}
            </div>

            <h3 className="mt-3 font-serif text-2xl sm:text-3xl text-black">
              {event.title}
            </h3>

            <p className="mt-3 text-sm text-black/60 leading-relaxed font-sans max-w-2xl">
              {event.description}
            </p>
          </div>

          <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-xs text-black/50">
              {event.location}
            </span>
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="pill-btn text-xs py-2.5 px-5"
            >
              Luma RSVP ↗
            </a>
          </div>
        </div>
      </div>
      <p className="sr-only">{formatFullDate(event.datetime)}</p>
    </article>
  );
}
