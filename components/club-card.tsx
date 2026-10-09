import Link from "next/link";
import { ClubImage } from "@/components/club-image";
import { formatMonthDay, formatTime } from "@/lib/format";
import { getNextEvent, type Club } from "@/lib/clubs";

export function ClubCard({ club, now, index }: { club: Club; now: Date; index?: number }) {
  const next = getNextEvent(club.slug, now);
  const indexStr = index !== undefined ? String(index + 1).padStart(2, "0") : undefined;

  return (
    <article className="group flex flex-col justify-between border border-[#e5e2da] bg-[#ffffff] transition-colors hover:border-[#0a0a0a] dark:border-[#262626] dark:bg-[#121212] dark:hover:border-[#f9f8f5]">
      <div>
        {/* Top Ledger Strip */}
        <div className="flex items-center justify-between border-b border-[#e5e2da] px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-[#737373] dark:border-[#262626]">
            <div className="flex items-center gap-2">
            {indexStr ? <span className="text-[#0a0a0a] dark:text-[#f9f8f5] font-semibold">{indexStr}</span> : null}
            <span>/</span>
            <span>{club.theme?.tag ?? "Club"}</span>
          </div>
          <span className="text-[#0a0a0a] dark:text-[#f9f8f5]">
            {club.status === "active" ? "Active" : "Incubating"}
          </span>
        </div>

        {/* Documentary Photography Frame */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f2efe9] dark:bg-[#1a1a1a]">
          <ClubImage
            src={club.heroImage}
            alt={club.name}
            label={club.name}
            tone={club.slug}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover grayscale contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.02]"
          />
        </div>

        {/* Content Block */}
        <div className="p-6">
          <h3 className="font-serif text-3xl text-[#0a0a0a] dark:text-[#f9f8f5] tracking-tight">
            {club.name}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#737373]">
            {club.tagline}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-[#404040] dark:text-[#a3a3a3]">
            {club.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e5e2da] pt-4 font-mono text-[11px] dark:border-[#262626]">
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-[#737373]">Cadence</span>
              <span className="mt-0.5 block text-[#0a0a0a] dark:text-[#f9f8f5]">{club.cadence}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-[#737373]">Location</span>
              <span className="mt-0.5 block text-[#0a0a0a] dark:text-[#f9f8f5] truncate">{club.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Next Event Bar */}
      <div className="border-t border-[#e5e2da] bg-[#f9f8f5] p-5 dark:border-[#262626] dark:bg-[#141414]">
        {next ? (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#1900ff] dark:text-[#3b82f6] font-medium">
                Next: {formatMonthDay(next.datetime)} · {formatTime(next.datetime)}
              </span>
              <span className="block truncate font-serif text-sm text-[#0a0a0a] dark:text-[#f9f8f5]">
                {next.title}
              </span>
            </div>
            <Link
              href={`/clubs/${club.slug}`}
              className="shrink-0 border border-[#0a0a0a] bg-[#0a0a0a] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#f9f8f5] hover:bg-[#1900ff] hover:border-[#1900ff] dark:border-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] dark:hover:bg-[#1900ff] dark:hover:text-[#f9f8f5] transition-colors"
            >
              Open →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#737373]">
              Schedule TBA
            </span>
            <Link
              href={`/clubs/${club.slug}`}
              className="shrink-0 border border-[#e5e2da] bg-transparent px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#0a0a0a] hover:border-[#0a0a0a] dark:border-[#262626] dark:text-[#f9f8f5] dark:hover:border-[#f9f8f5] transition-colors"
            >
              Details →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
