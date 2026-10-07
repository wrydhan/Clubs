import Link from "next/link";
import { clubSubscribeUrl } from "@/lib/site";
import { formatFullDate, formatTime } from "@/lib/format";
import type { Club, ClubEvent } from "@/lib/clubs";
import { btnPrimary } from "@/lib/styles";

export function RsvpCard({ club, event }: { club: Club; event: ClubEvent | undefined }) {
  if (club.status === "coming-soon") {
    return (
      <aside id="rsvp" className="scroll-mt-20 border-2 border-ink bg-card p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Coming soon</p>
        <h2 className="mt-2 font-serif text-4xl leading-none">Not on the calendar yet.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Car Club is the one you can RSVP to right now. This one will show up here when someone is actually running it.
        </p>
        <Link href="/clubs/cars" className={`${btnPrimary} mt-5 w-full`}>
          See Car Club
        </Link>
      </aside>
    );
  }

  if (!event) {
    return (
      <aside id="rsvp" className="scroll-mt-20 border-2 border-ink bg-card p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Next event</p>
        <h2 className="mt-2 font-serif text-4xl leading-none">No date yet.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {club.name} doesn&apos;t have an upcoming session posted. Subscribe and you&apos;ll get the first one.
        </p>
        <a href={clubSubscribeUrl(club.slug)} className={`${btnPrimary} mt-5 w-full`}>
          Subscribe
        </a>
        {club.lead ? (
          <a href={`mailto:${club.lead.contact}`} className="mt-3 block text-sm underline underline-offset-4">
            Ask {club.lead.name.split(" ")[0]}
          </a>
        ) : null}
      </aside>
    );
  }

  return (
    <aside id="rsvp" className="scroll-mt-20 border-2 border-ink bg-card p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Next up</p>
      <p className="mt-2 font-serif text-[2rem] leading-none">{formatFullDate(event.datetime)}</p>
      <h2 className="mt-2 font-serif text-[1.7rem] leading-tight">{event.title}</h2>
      <p className="mt-2 text-sm text-muted">
        {formatTime(event.datetime)} · {event.location}
        {event.capacity ? ` · ${event.capacity} spots` : ""}
      </p>
      <p className="mt-3 text-sm leading-relaxed">{event.description}</p>
      <a href={event.rsvpUrl} className={`${btnPrimary} mt-5 w-full`}>
        RSVP
      </a>
    </aside>
  );
}
