import Link from "next/link";
import { getClubs } from "@/lib/clubs";

export function ClubNav({ currentSlug }: { currentSlug?: string }) {
  const clubs = getClubs();

  return (
    <aside className="border-b md:border-b-0 border-[#e5e2da] bg-[#f9f8f5] p-6 dark:border-[#262626] dark:bg-[#0a0a0a]">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
        Roster Index
      </span>
      <nav className="mt-4 flex flex-wrap md:flex-col gap-1 font-mono text-xs">
        <Link
          href="/clubs"
          className="px-2 py-1.5 text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#f9f8f5] transition-colors"
        >
          ← All Clubs
        </Link>
        {clubs.map((club) => {
          const active = club.slug === currentSlug;
          return (
            <Link
              key={club.slug}
              href={`/clubs/${club.slug}`}
              className={`px-2 py-1.5 transition-colors ${
                active
                  ? "bg-[#0a0a0a] text-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] font-medium"
                  : "text-[#404040] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#f9f8f5]"
              }`}
            >
              {club.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
