import Link from "next/link";
import { Scrap, Tape, Stamp } from "@/components/collage/paper";
import { clubSubscribeUrl } from "@/lib/site";
import { formatFullDate, formatTime } from "@/lib/format";
import type { Club, ClubEvent } from "@/lib/clubs";

export function RsvpCard({ club, event }: { club: Club; event: ClubEvent | undefined }) {
  if (club.status === "coming-soon") {
    return (
      <Scrap id="rsvp" tone="cream" rotate={-0.9} className="relative h-full scroll-mt-24 px-6 py-7">
        <Tape className="-right-4 -top-3" rotate={20} width={90} height={26} />
        <span className="label">Charter status</span>
        <h2 className="mt-2 font-serif text-[1.9rem] leading-none">Not on the calendar yet.</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-ink/75">
          Car Club has confirmed track dates at Sonoma. {club.name} is still finalising schedule
          and facilities at Fort Mason.
        </p>
        <Stamp className="mt-5">chartering</Stamp>
        <Link href="/clubs/cars" className="pill-btn mt-6 w-full">
          See the Car Club schedule
        </Link>
      </Scrap>
    );
  }

  if (!event) {
    return (
      <Scrap id="rsvp" tone="cream" rotate={-0.9} className="relative h-full scroll-mt-24 px-6 py-7">
        <Tape className="-right-4 -top-3" rotate={20} width={90} height={26} />
        <span className="label">Next session</span>
        <h2 className="mt-2 font-serif text-[1.9rem] leading-none">Schedule TBA.</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-ink/75">
          {club.name} has no upcoming session posted. Subscribe and the date lands in your calendar
          the moment it drops.
        </p>
        <a href={clubSubscribeUrl(club.slug)} className="pill-btn mt-6 w-full">
          Subscribe for updates
        </a>
        {club.lead ? (
          <a
            href={`mailto:${club.lead.contact}`}
            className="mt-4 block text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink/55 underline underline-offset-4 hover:text-ink"
          >
            {club.lead.name.split(" ")[0]} · {club.lead.contact}
          </a>
        ) : null}
      </Scrap>
    );
  }

  return (
    <Scrap id="rsvp" tone="cream" rotate={-0.9} className="relative h-full scroll-mt-24 px-6 py-7">
      <Tape className="-right-4 -top-3" rotate={20} width={90} height={26} />
      <div className="flex items-center justify-between gap-3">
        <span className="label">Next session</span>
        {event.capacity ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45">
            {event.capacity} cap
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 font-serif text-[1.9rem] leading-[0.95]">{event.title}</h2>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">
        {formatFullDate(event.datetime)} · {formatTime(event.datetime)}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/50">
        {event.location}
      </p>
      <p className="mt-4 text-[13px] leading-relaxed text-ink/75">{event.description}</p>

      <a
        href={event.rsvpUrl}
        target="_blank"
        rel="noreferrer"
        className="pill-btn mt-6 w-full"
      >
        RSVP on Luma ↗
      </a>
      <Link
        href="/clubs/calendar"
        className="mt-3 block text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink/55 underline underline-offset-4 hover:text-ink"
      >
        Add it to your calendar
      </Link>
    </Scrap>
  );
}
