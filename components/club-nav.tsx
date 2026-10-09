import Link from "next/link";
import { getClubs } from "@/lib/clubs";

export function ClubNav({ currentSlug }: { currentSlug?: string }) {
  const clubs = getClubs();

  return (
    <aside className="border-b md:border-b-0 border-[#D8D2C3] bg-[#F5F2EA] p-6 dark:border-[#2E2B22] dark:bg-[#12110C]">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
        Roster Index
      </span>
      <nav className="mt-4 flex flex-wrap md:flex-col gap-1 font-mono text-xs">
        <Link
          href="/clubs"
          className="px-2 py-1.5 text-[#8A8678] hover:text-[#12110C] dark:hover:text-[#F5F2EA] transition-colors"
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
                  ? "bg-[#12110C] text-[#F5F2EA] dark:bg-[#F5F2EA] dark:text-[#12110C] font-medium"
                  : "text-[#3A3830] hover:text-[#12110C] dark:text-[#9B978A] dark:hover:text-[#F5F2EA]"
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
