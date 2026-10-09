import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e5e2da] bg-[#f9f8f5]/95 backdrop-blur-sm dark:border-[#262626] dark:bg-[#0a0a0a]/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/clubs" className="flex items-baseline gap-2.5 group">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#0a0a0a] dark:text-[#f9f8f5]">
              FOUNDERS, INC.
            </span>
            <span className="text-[#a3a3a3] text-xs">/</span>
            <span className="font-serif italic text-sm text-[#404040] dark:text-[#a3a3a3] group-hover:text-[#1900ff] transition-colors">
              Clubs
            </span>
          </Link>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-[#737373] border-l border-[#e5e2da] pl-4 dark:border-[#262626]">
            Pier 2 · Fort Mason, SF
          </span>
        </div>

        <nav className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-[#404040] dark:text-[#a3a3a3]">
          <Link
            href="/clubs"
            className="hover:text-[#0a0a0a] dark:hover:text-[#f9f8f5] transition-colors"
          >
            Roster
          </Link>
          <Link
            href="/clubs/calendar"
            className="hover:text-[#0a0a0a] dark:hover:text-[#f9f8f5] transition-colors"
          >
            Calendar
          </Link>
          <Link
            href="/clubs/apply"
            className="border border-[#0a0a0a] bg-[#0a0a0a] px-3 py-1 text-[#f9f8f5] hover:bg-[#1900ff] hover:border-[#1900ff] dark:border-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] dark:hover:bg-[#1900ff] dark:hover:text-[#f9f8f5] transition-colors"
          >
            Start a Club
          </Link>
        </nav>
      </div>
    </header>
  );
}
