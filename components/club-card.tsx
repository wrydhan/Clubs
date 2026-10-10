import Link from "next/link";
import { ClubImage } from "@/components/club-image";
import { formatMonthDay, formatTime } from "@/lib/format";
import { getNextEvent, type Club } from "@/lib/clubs";

export function ClubCard({ club, now, index }: { club: Club; now: Date; index?: number }) {
  const next = getNextEvent(club.slug, now);
  const indexStr = index !== undefined ? String(index + 1).padStart(2, "0") : undefined;

  const badgeClass =
    club.slug === "cars"
      ? "badge-car"
      : club.slug === "hardware"
      ? "badge-hardware"
      : club.slug === "basketball"
      ? "badge-basketball"
      : "badge-paintball";

  return (
    <article className="group flex flex-col justify-between finc-card p-6 transition-all duration-200 hover:bg-[#EBEBEB]">
      <div>
        {/* Top Meta Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {indexStr ? (
              <span className="font-mono text-xs font-semibold text-black">{indexStr}</span>
            ) : null}
            <span className="text-black/30 font-mono text-xs">/</span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-tight ${badgeClass}`}
            >
              {club.theme?.tag ?? "Club"}
            </span>
          </div>

          <span className="text-xs font-mono uppercase tracking-wider text-black/40">
            {club.status === "active" ? "Active Season" : "Chartering"}
          </span>
        </div>

        {/* Cinematic Imagery */}
        <div className="mt-5 relative aspect-[16/10] w-full overflow-hidden rounded-[12px] bg-black/5">
          <ClubImage
            src={club.heroImage}
            alt={club.name}
            label={club.name}
            tone={club.slug}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="mt-6">
          <h3 className="font-serif text-3xl text-black">
            {club.name}
          </h3>
          <p className="mt-2 text-sm text-black/70 leading-relaxed font-sans">
            {club.description}
          </p>
        </div>

        {/* Cadence & Location meta */}
        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t-0 bg-white/60 rounded-[10px] p-3">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-black/40">Cadence</span>
            <span className="mt-0.5 block text-xs font-medium text-black">{club.cadence}</span>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-black/40">Location</span>
            <span className="mt-0.5 block text-xs font-medium text-black truncate">{club.location}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-2 flex items-center justify-between gap-4">
        {next ? (
          <div className="min-w-0">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-black/50">
              Next: {formatMonthDay(next.datetime)}
            </span>
            <span className="block truncate font-medium text-xs text-black">
              {next.title}
            </span>
          </div>
        ) : (
          <span className="font-mono text-[11px] text-black/40">
            Schedule to be announced
          </span>
        )}

        <Link
          href={`/clubs/${club.slug}`}
          className="shrink-0 pill-btn text-xs py-2 px-4"
        >
          View Club →
        </Link>
      </div>
    </article>
  );
}
