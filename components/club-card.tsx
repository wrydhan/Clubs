import Link from "next/link";
import { ClubImage } from "@/components/club-image";
import { getNextEvent, type Club } from "@/lib/clubs";
import { formatFullDate } from "@/lib/format";

export function ClubCard({ club, now = new Date() }: { club: Club; now?: Date }) {
  const next = getNextEvent(club.slug, now);
  return (
    <Link href={`/clubs/${club.slug}`} className="group block">
      <ClubImage
        src={club.heroImage}
        alt={`${club.name} in San Francisco`}
        label={club.name}
        tone={club.slug}
        className="aspect-[4/3] w-full"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-[1.7rem] leading-none group-hover:underline">{club.name}</h3>
        {club.status === "coming-soon" ? (
          <span className="shrink-0 bg-chip px-1.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
            Coming soon
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-snug text-muted">{club.tagline}</p>
      {club.status === "coming-soon" ? (
        <p className="mt-3 text-sm text-muted">Not on the calendar yet</p>
      ) : (
        <>
          <p className="mt-3 text-sm">{club.cadence}</p>
          <p className="text-sm text-muted">{next ? `Next · ${formatFullDate(next.datetime)}` : "No date yet"}</p>
        </>
      )}
    </Link>
  );
}
