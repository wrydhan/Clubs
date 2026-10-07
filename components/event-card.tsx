import Link from "next/link";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

export function EventCard({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <article className="grid grid-cols-[3.25rem_1fr] gap-x-4 border border-line bg-card p-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{formatWeekday(event.datetime)}</p>
        <p className="font-serif text-[2.6rem] leading-none">{formatDay(event.datetime)}</p>
      </div>
      <div className="min-w-0">
        {club ? (
          <Link
            href={`/clubs/${club.slug}`}
            className="text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink hover:underline"
          >
            {club.name}
          </Link>
        ) : null}
        <h3 className="font-serif text-[1.65rem] leading-[1.05]">{event.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {formatTime(event.datetime)} · {event.location}
          {event.capacity ? ` · ${event.capacity} spots` : ""}
        </p>
        <a
          href={event.rsvpUrl}
          className="mt-3 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper hover:opacity-90"
        >
          RSVP
        </a>
        <p className="sr-only">{formatFullDate(event.datetime)}</p>
      </div>
    </article>
  );
}
