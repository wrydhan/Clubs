import Link from "next/link";
import { getClub, type ClubEvent } from "@/lib/clubs";
import { formatDay, formatFullDate, formatTime, formatWeekday } from "@/lib/format";

export function EventCard({ event }: { event: ClubEvent }) {
  const club = getClub(event.clubSlug);
  return (
    <article className="group relative border border-line bg-card hover:border-line-strong transition-all p-5 hover:shadow-sm">
      <div className="grid grid-cols-[3.5rem_1fr] gap-x-5 items-start">
        <div className="flex flex-col items-center justify-center border border-line bg-paper-subtle py-2.5 px-1 rounded-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-medium">
            {formatWeekday(event.datetime)}
          </span>
          <span className="font-serif text-[2.5rem] leading-none text-ink mt-0.5">
            {formatDay(event.datetime)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {club ? (
              <Link
                href={`/clubs/${club.slug}`}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:text-accent-hover font-semibold transition-colors"
              >
                {club.name}
              </Link>
            ) : null}
            <span className="text-muted/40 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              {event.location.split("·")[0].trim()}
            </span>
          </div>
          <h3 className="mt-1 font-serif text-[1.75rem] leading-[1.1] text-ink group-hover:text-accent transition-colors">
            {event.title}
          </h3>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed line-clamp-2">
            {event.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              <span>{formatTime(event.datetime)}</span>
              {event.capacity ? <span>· {event.capacity} spots</span> : null}
            </div>
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center bg-ink px-4 text-xs font-medium text-paper hover:bg-accent hover:text-white transition-colors rounded-sm"
            >
              RSVP on Luma →
            </a>
          </div>
        </div>
      </div>
      <p className="sr-only">{formatFullDate(event.datetime)}</p>
    </article>
  );
}
