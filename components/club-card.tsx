import Link from "next/link";
import { ClubImage } from "@/components/club-image";
import { getNextEvent, type Club } from "@/lib/clubs";
import { formatFullDate } from "@/lib/format";

export function ClubCard({ club, now = new Date() }: { club: Club; now?: Date }) {
  const next = getNextEvent(club.slug, now);
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group relative flex flex-col justify-between border border-line bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
    >
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-line/60 bg-paper-subtle">
          <ClubImage
            src={club.heroImage}
            alt={`${club.name} in San Francisco`}
            label={club.name}
            tone={club.slug}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {club.status === "coming-soon" ? (
            <div className="absolute right-3 top-3 rounded-sm bg-ink/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-paper backdrop-blur-sm">
              Coming Soon
            </div>
          ) : (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-sm bg-paper/95 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink backdrop-blur-sm border border-line/50">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active Club
            </div>
          )}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[1.85rem] leading-none text-ink group-hover:text-accent transition-colors">
            {club.name}
          </h3>
          <span className="font-mono text-xs text-muted group-hover:text-ink transition-colors">
            ↗
          </span>
        </div>

        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          {club.tagline}
        </p>
      </div>

      <div className="mt-6 border-t border-line/60 pt-4">
        {club.status === "coming-soon" ? (
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span>Status</span>
            <span>Registration Opening Soon</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-xs font-mono">
            <div className="flex items-center justify-between text-muted">
              <span>Cadence</span>
              <span className="text-ink font-medium">{club.cadence}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Next Session</span>
              <span className="text-accent font-medium">
                {next ? formatFullDate(next.datetime) : "Announcing Soon"}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
