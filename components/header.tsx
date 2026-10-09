import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8D2C3] bg-[#F5F2EA]/95 backdrop-blur-sm dark:border-[#2E2B22] dark:bg-[#12110C]/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/clubs" className="flex items-baseline gap-2.5 group">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#12110C] dark:text-[#F5F2EA]">
              FOUNDERS, INC.
            </span>
            <span className="text-[#9B978A] text-xs">/</span>
            <span className="font-serif italic text-sm text-[#3A3830] dark:text-[#9B978A] group-hover:text-[#E8452B] transition-colors">
              Clubs
            </span>
          </Link>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-[#8A8678] border-l border-[#D8D2C3] pl-4 dark:border-[#2E2B22]">
            Pier 2 · Fort Mason, SF
          </span>
        </div>

        <nav className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-[#3A3830] dark:text-[#9B978A]">
          <Link
            href="/clubs"
            className="hover:text-[#12110C] dark:hover:text-[#F5F2EA] transition-colors"
          >
            Roster
          </Link>
          <Link
            href="/clubs/calendar"
            className="hover:text-[#12110C] dark:hover:text-[#F5F2EA] transition-colors"
          >
            Calendar
          </Link>
          <Link
            href="/clubs/apply"
            className="border border-[#12110C] bg-[#12110C] px-3 py-1 text-[#F5F2EA] hover:bg-[#E8452B] hover:border-[#E8452B] dark:border-[#F5F2EA] dark:bg-[#F5F2EA] dark:text-[#12110C] dark:hover:bg-[#E8452B] dark:hover:text-[#F5F2EA] transition-colors"
          >
            Start a Club
          </Link>
        </nav>
      </div>
    </header>
  );
}
