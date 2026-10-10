import Link from "next/link";
import { getClubs } from "@/lib/clubs";

export function ClubNav({ currentSlug }: { currentSlug?: string }) {
  const clubs = getClubs();

  return (
    <aside className="p-6 md:p-8 bg-[#F1F1F1] rounded-[15px] mb-8 md:mb-0">
      <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
        Campus Directory
      </span>
      <nav className="mt-4 flex flex-wrap md:flex-col gap-2 font-mono text-xs">
        <Link
          href="/clubs"
          className="px-3 py-2 rounded-full text-black/50 hover:text-black hover:bg-black/5 transition-colors"
        >
          ← All Clubs
        </Link>
        {clubs.map((club) => {
          const active = club.slug === currentSlug;
          return (
            <Link
              key={club.slug}
              href={`/clubs/${club.slug}`}
              className={`px-3 py-2 rounded-full transition-all ${
                active
                  ? "bg-black text-white font-medium"
                  : "text-black/70 hover:text-black hover:bg-black/5"
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
