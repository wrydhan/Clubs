import Link from "next/link";
import { clubSubscribeUrl } from "@/lib/site";
import { formatFullDate, formatTime } from "@/lib/format";
import type { Club, ClubEvent } from "@/lib/clubs";

export function RsvpCard({ club, event }: { club: Club; event: ClubEvent | undefined }) {
  if (club.status === "coming-soon") {
    return (
      <aside id="rsvp" className="scroll-mt-20 finc-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-black/50">
            Charter Status
          </span>
        </div>
        <h2 className="mt-3 font-serif text-3xl text-black">Not on calendar yet.</h2>
        <p className="mt-3 text-sm leading-relaxed text-black/60 font-sans">
          Car Club has confirmed track dates at Sonoma. {club.name} is finalizing schedule and facilities at Fort Mason.
        </p>
        <Link
          href="/clubs/cars"
          className="mt-6 pill-btn w-full text-center text-xs py-3"
        >
          See Car Club Schedule →
        </Link>
      </aside>
    );
  }

  if (!event) {
    return (
      <aside id="rsvp" className="scroll-mt-20 finc-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-black/40" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-black/50">
            Next Session
          </span>
        </div>
        <h2 className="mt-3 font-serif text-3xl text-black">Schedule TBA.</h2>
        <p className="mt-3 text-sm leading-relaxed text-black/60 font-sans">
          {club.name} doesn&apos;t have an upcoming session posted. Subscribe to get notified as soon as dates drop.
        </p>
        <a
          href={clubSubscribeUrl(club.slug)}
          className="mt-6 pill-btn w-full text-center text-xs py-3"
        >
          Subscribe for Updates →
        </a>
        {club.lead ? (
          <a
            href={`mailto:${club.lead.contact}`}
            className="mt-4 block text-center font-mono text-xs text-black/50 hover:text-black underline underline-offset-4"
          >
            Contact {club.lead.name.split(" ")[0]} ({club.lead.contact})
          </a>
        ) : null}
      </aside>
    );
  }

  return (
    <aside id="rsvp" className="scroll-mt-20 finc-card p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-950">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Upcoming Track Session
        </span>
        {event.capacity ? (
          <span className="font-mono text-[11px] text-black/40">{event.capacity} Driver Cap</span>
        ) : null}
      </div>

      <div className="mt-6">
        <div className="font-mono text-xs uppercase tracking-wider text-black/40">
          {formatFullDate(event.datetime)} · {formatTime(event.datetime)}
        </div>
        <h2 className="mt-2 font-serif text-3xl text-black">{event.title}</h2>
        <div className="mt-2 font-mono text-xs text-black/60">
          📍 {event.location}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-black/70 font-sans">
        {event.description}
      </p>

      <a
        href={event.rsvpUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 pill-btn w-full text-center text-xs py-3"
      >
        RSVP on Luma →
      </a>
    </aside>
  );
}
