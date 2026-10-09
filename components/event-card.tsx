import Link from "next/link";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

export function EventCard({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <article className="group border border-[#D8D2C3] bg-[#FCFAF5] transition-colors hover:border-[#12110C] dark:border-[#2E2B22] dark:bg-[#17150F] dark:hover:border-[#F5F2EA]">
      <div className="flex flex-col sm:flex-row sm:items-stretch divide-y sm:divide-y-0 sm:divide-x divide-[#D8D2C3] dark:divide-[#2E2B22]">
        {/* Date block */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center p-4 sm:p-6 bg-[#F5F2EA] dark:bg-[#1C1A13] sm:w-28 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
            {formatWeekday(event.datetime)}
          </span>
          <span className="font-serif text-3xl sm:text-4xl leading-none text-[#12110C] dark:text-[#F5F2EA]">
            {formatDay(event.datetime)}
          </span>
          <span className="font-mono text-[10px] text-[#8A8678]">
            {formatTime(event.datetime)}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#8A8678]">
              {club ? (
                <Link
                  href={`/clubs/${club.slug}`}
                  className="font-medium text-[#12110C] hover:text-[#E8452B] dark:text-[#F5F2EA] dark:hover:text-[#FF6A3D] transition-colors"
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

            <h3 className="mt-2 font-serif text-2xl text-[#12110C] dark:text-[#F5F2EA] group-hover:text-[#E8452B] dark:group-hover:text-[#FF6A3D] transition-colors">
              {event.title}
            </h3>

            <p className="mt-2 text-sm text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#D8D2C3] dark:border-[#2E2B22] flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8678]">
              {event.location}
            </span>
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-[#12110C] bg-[#12110C] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#F5F2EA] hover:bg-[#E8452B] hover:border-[#E8452B] dark:border-[#F5F2EA] dark:bg-[#F5F2EA] dark:text-[#12110C] dark:hover:bg-[#E8452B] dark:hover:text-[#F5F2EA] transition-colors"
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
