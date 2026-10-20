import Link from "next/link";
import { getClubs } from "@/lib/clubs";

export function ClubNav({ currentSlug }: { currentSlug?: string }) {
  const clubs = getClubs();

  return (
    <nav className="mb-8 md:mb-0" aria-label="Campus clubs">
      <span className="label">On the wall</span>
      <ul className="mt-3 flex flex-wrap gap-2 md:flex-col md:items-start">
        <li>
          <Link
            href="/clubs"
            className="inline-flex min-h-[36px] items-center bg-ink/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:bg-ink/15 hover:text-ink"
          >
            ← The whole wall
          </Link>
        </li>
        {clubs.map((club) => {
          const active = club.slug === currentSlug;
          return (
            <li key={club.slug}>
              <Link
                href={`/clubs/${club.slug}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[36px] items-center px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "bg-ink/8 text-ink-2 hover:bg-ink/15 hover:text-ink"
                }`}
              >
                {club.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
