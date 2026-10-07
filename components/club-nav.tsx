import Link from "next/link";
import { getClubs } from "@/lib/clubs";

export function ClubNav({ currentSlug }: { currentSlug: string }) {
  const clubs = getClubs();

  return (
    <nav
      aria-label="Clubs"
      className="sticky top-14 z-30 border-b border-line bg-paper md:z-0 md:h-[calc(100svh-3.5rem)] md:overflow-y-auto md:border-b-0 md:border-r"
    >
      <p className="hidden px-4 pt-6 text-[11px] uppercase tracking-[0.16em] text-muted md:block">Clubs</p>
      <ul className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:px-3 md:py-3">
        {clubs.map((club) => {
          const current = club.slug === currentSlug;
          return (
            <li key={club.slug} className="shrink-0 md:shrink">
              <Link
                href={`/clubs/${club.slug}`}
                aria-current={current ? "page" : undefined}
                className={`block min-w-[7.5rem] px-3 py-2 md:min-w-0 md:px-2 md:py-2.5 ${
                  current ? "bg-ink text-paper" : "hover:underline"
                }`}
              >
                <span className="block text-sm leading-tight">{club.name}</span>
                {club.status === "coming-soon" ? (
                  <span className={`mt-0.5 block text-[11px] ${current ? "text-paper/70" : "text-muted"}`}>
                    Coming soon
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
