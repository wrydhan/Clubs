import Link from "next/link";
import { clubSubscribeUrl } from "@/lib/site";
import { formatFullDate, formatTime } from "@/lib/format";
import type { Club, ClubEvent } from "@/lib/clubs";

export function RsvpCard({ club, event }: { club: Club; event: ClubEvent | undefined }) {
  if (club.status === "coming-soon") {
    return (
      <aside id="rsvp" className="scroll-mt-20 border border-line bg-card/95 backdrop-blur-md p-6 shadow-sm rounded-sm">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Status
        </div>
        <h2 className="mt-2 font-serif text-3xl leading-none text-ink">Not on calendar yet.</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Car Club has confirmed track dates. {club.name} is finalizing schedule and facilities at Fort Mason.
        </p>
        <Link
          href="/clubs/cars"
          className="mt-6 flex h-11 w-full items-center justify-center bg-ink text-xs font-mono font-medium uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
        >
          See Car Club Schedule →
        </Link>
      </aside>
    );
  }

  if (!event) {
    return (
      <aside id="rsvp" className="scroll-mt-20 border border-line bg-card/95 backdrop-blur-md p-6 shadow-sm rounded-sm">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Next Session
        </div>
        <h2 className="mt-2 font-serif text-3xl leading-none text-ink">No date posted.</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          {club.name} doesn&apos;t have an upcoming session posted. Subscribe to get the next date as soon as it drops.
        </p>
        <a
          href={clubSubscribeUrl(club.slug)}
          className="mt-6 flex h-11 w-full items-center justify-center bg-ink text-xs font-mono font-medium uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
        >
          Subscribe for Updates →
        </a>
        {club.lead ? (
          <a
            href={`mailto:${club.lead.contact}`}
            className="mt-4 block text-center font-mono text-xs text-muted hover:text-ink hover:underline underline-offset-4"
          >
            Ask {club.lead.name.split(" ")[0]} ({club.lead.contact})
          </a>
        ) : null}
      </aside>
    );
  }

  return (
    <aside id="rsvp" className="scroll-mt-20 border border-line bg-card/95 backdrop-blur-md p-6 shadow-md rounded-sm">
      <div className="flex items-center justify-between border-b border-line/60 pb-3 font-mono text-xs">
        <span className="text-accent uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Upcoming Event
        </span>
        {event.capacity ? (
          <span className="text-muted">{event.capacity} Capacity</span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="font-mono text-xs uppercase tracking-wider text-muted">
          {formatFullDate(event.datetime)} · {formatTime(event.datetime)}
        </div>
        <h2 className="mt-1 font-serif text-[1.85rem] leading-[1.1] text-ink">{event.title}</h2>
        <div className="mt-1 font-mono text-xs text-muted">
          📍 {event.location}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-secondary line-clamp-4">
        {event.description}
      </p>

      <a
        href={event.rsvpUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex h-12 w-full items-center justify-center bg-ink text-xs font-mono font-medium uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm shadow-sm"
      >
        RSVP on Luma →
      </a>
    </aside>
  );
}
