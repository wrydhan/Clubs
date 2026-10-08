import Link from "next/link";
import { getClubs } from "@/lib/clubs";

export function ClubNav({ currentSlug }: { currentSlug: string }) {
  const clubs = getClubs();

  return (
    <nav
      aria-label="Clubs"
      className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-sm md:z-0 md:h-[calc(100svh-4rem)] md:overflow-y-auto md:border-b-0 md:border-r border-line p-4 md:p-6"
    >
      <div className="flex items-center justify-between pb-3 md:pb-4 border-b border-line/60">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          All Clubs
        </p>
        <span className="font-mono text-[10px] text-accent font-semibold">{clubs.length}</span>
      </div>
      <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto md:flex-col md:gap-1.5 md:overflow-visible">
        {clubs.map((club) => {
          const current = club.slug === currentSlug;
          return (
            <li key={club.slug} className="shrink-0 md:shrink">
              <Link
                href={`/clubs/${club.slug}`}
                aria-current={current ? "page" : undefined}
                className={`group flex items-center justify-between min-w-[8.5rem] md:min-w-0 rounded-sm px-3 py-2.5 transition-all ${
                  current
                    ? "bg-ink text-paper font-medium shadow-sm"
                    : "text-ink/80 hover:bg-paper-subtle hover:text-ink"
                }`}
              >
                <div>
                  <span className="block text-sm leading-tight font-serif text-[1.1rem]">
                    {club.name}
                  </span>
                  {club.status === "coming-soon" ? (
                    <span
                      className={`mt-0.5 block font-mono text-[9px] uppercase tracking-wider ${
                        current ? "text-paper/70" : "text-muted"
                      }`}
                    >
                      Upcoming
                    </span>
                  ) : (
                    <span
                      className={`mt-0.5 block font-mono text-[9px] uppercase tracking-wider ${
                        current ? "text-paper/80" : "text-accent"
                      }`}
                    >
                      Active
                    </span>
                  )}
                </div>
                <span
                  className={`hidden md:inline font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 ${
                    current ? "text-paper opacity-100" : "text-muted"
                  }`}
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hidden md:block mt-8 pt-6 border-t border-line/60">
        <Link
          href="/clubs/apply"
          className="block w-full border border-line bg-paper-subtle px-3 py-2.5 text-center font-mono text-xs text-ink hover:border-ink transition-colors rounded-sm"
        >
          + Propose New Club
        </Link>
      </div>
    </nav>
  );
}
