import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/clubs" className="flex items-baseline gap-2">
          <span className="hidden text-[11px] uppercase tracking-[0.16em] text-muted sm:inline">
            Founders, Inc.
          </span>
          <span className="font-serif text-[1.45rem] leading-none">Clubs</span>
        </Link>
        <nav className="flex items-center gap-4 text-[15px] sm:gap-6" aria-label="Primary">
          <Link href="/clubs/calendar" className="hover:underline">
            Calendar
          </Link>
          <Link href="/clubs/apply" className="hover:underline">
            Apply
          </Link>
        </nav>
      </div>
    </header>
  );
}
