import Link from "next/link";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

export function EventCard({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <article className="group border border-[#e5e2da] bg-white transition-colors hover:border-[#0a0a0a] dark:border-[#262626] dark:bg-[#121212] dark:hover:border-[#f9f8f5]">
      <div className="flex flex-col sm:flex-row sm:items-stretch divide-y sm:divide-y-0 sm:divide-x divide-[#e5e2da] dark:divide-[#262626]">
        {/* Date block */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center p-4 sm:p-6 bg-[#f9f8f5] dark:bg-[#141414] sm:w-28 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
            {formatWeekday(event.datetime)}
          </span>
          <span className="font-serif text-3xl sm:text-4xl leading-none text-[#0a0a0a] dark:text-[#f9f8f5]">
            {formatDay(event.datetime)}
          </span>
          <span className="font-mono text-[10px] text-[#737373]">
            {formatTime(event.datetime)}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#737373]">
              {club ? (
                <Link
                  href={`/clubs/${club.slug}`}
                  className="font-medium text-[#0a0a0a] hover:text-[#1900ff] dark:text-[#f9f8f5] dark:hover:text-[#3b82f6] transition-colors"
                >
                  {club.name}
                </Link>
              ) : null}
              <span>/</span>
              <span>{event.location.split("·")[0].trim()}</span>
              {event.capacity ? (
                <>
                  <span>/</span>
                  <span>{event.capacity} cap</span>
                </>
              ) : null}
            </div>

            <h3 className="mt-2 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5] group-hover:text-[#1900ff] dark:group-hover:text-[#3b82f6] transition-colors">
              {event.title}
            </h3>

            <p className="mt-2 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#e5e2da] dark:border-[#262626] flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">
              {event.location}
            </span>
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-[#0a0a0a] bg-[#0a0a0a] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#f9f8f5] hover:bg-[#1900ff] hover:border-[#1900ff] dark:border-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] dark:hover:bg-[#1900ff] dark:hover:text-[#f9f8f5] transition-colors"
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
