import Link from "next/link";
import { ClubImage } from "@/components/club-image";
import { formatMonthDay, formatTime } from "@/lib/format";
import { getNextEvent, type Club } from "@/lib/clubs";

export function ClubCard({ club, now, index }: { club: Club; now: Date; index?: number }) {
  const next = getNextEvent(club.slug, now);
  const indexStr = index !== undefined ? String(index + 1).padStart(2, "0") : undefined;

  return (
    <article className="group flex flex-col justify-between border border-[#D8D2C3] bg-[#ffffff] transition-colors hover:border-[#12110C] dark:border-[#2E2B22] dark:bg-[#17150F] dark:hover:border-[#F5F2EA]">
      <div>
        {/* Top Ledger Strip */}
        <div className="flex items-center justify-between border-b border-[#D8D2C3] px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-[#8A8678] dark:border-[#2E2B22]">
            <div className="flex items-center gap-2">
            {indexStr ? <span className="text-[#12110C] dark:text-[#F5F2EA] font-semibold">{indexStr}</span> : null}
            <span>/</span>
            <span>{club.theme?.tag ?? "Club"}</span>
          </div>
          <span className="text-[#12110C] dark:text-[#F5F2EA]">
            {club.status === "active" ? "Active" : "Incubating"}
          </span>
        </div>

        {/* Documentary Photography Frame */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EBE6D9] dark:bg-[#211F17]">
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
          <h3 className="font-serif text-3xl text-[#12110C] dark:text-[#F5F2EA] tracking-tight">
            {club.name}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#8A8678]">
            {club.tagline}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-[#3A3830] dark:text-[#9B978A]">
            {club.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#D8D2C3] pt-4 font-mono text-[11px] dark:border-[#2E2B22]">
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-[#8A8678]">Cadence</span>
              <span className="mt-0.5 block text-[#12110C] dark:text-[#F5F2EA]">{club.cadence}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-[#8A8678]">Location</span>
              <span className="mt-0.5 block text-[#12110C] dark:text-[#F5F2EA] truncate">{club.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Next Event Bar */}
      <div className="border-t border-[#D8D2C3] bg-[#F5F2EA] p-5 dark:border-[#2E2B22] dark:bg-[#1C1A13]">
        {next ? (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#E8452B] dark:text-[#FF6A3D] font-medium">
                Next: {formatMonthDay(next.datetime)} · {formatTime(next.datetime)}
              </span>
              <span className="block truncate font-serif text-sm text-[#12110C] dark:text-[#F5F2EA]">
                {next.title}
              </span>
            </div>
            <Link
              href={`/clubs/${club.slug}`}
              className="shrink-0 border border-[#12110C] bg-[#12110C] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#F5F2EA] hover:bg-[#E8452B] hover:border-[#E8452B] dark:border-[#F5F2EA] dark:bg-[#F5F2EA] dark:text-[#12110C] dark:hover:bg-[#E8452B] dark:hover:text-[#F5F2EA] transition-colors"
            >
              Open →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#8A8678]">
              Schedule TBA
            </span>
            <Link
              href={`/clubs/${club.slug}`}
              className="shrink-0 border border-[#D8D2C3] bg-transparent px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#12110C] hover:border-[#12110C] dark:border-[#2E2B22] dark:text-[#F5F2EA] dark:hover:border-[#F5F2EA] transition-colors"
            >
              Details →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
