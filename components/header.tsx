import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/clubs" className="group flex items-baseline gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink">
              FOUNDERS, INC.
            </span>
            <span aria-hidden className="text-ink/30">
              /
            </span>
            <span className="font-serif text-lg italic leading-none text-ink/80 transition-colors group-hover:text-ink">
              Clubs
            </span>
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45 lg:inline">
            Pier 2 · Fort Mason, SF
          </span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-5">
          <Link
            href="/clubs"
            className="hidden text-[13px] font-medium tracking-tight text-ink/60 transition-colors hover:text-ink sm:inline"
          >
            The wall
          </Link>
          <Link
            href="/clubs/cars"
            className="hidden text-[13px] font-medium tracking-tight text-ink/60 transition-colors hover:text-ink sm:inline"
          >
            Car Club
          </Link>
          <Link
            href="/clubs/calendar"
            className="text-[13px] font-medium tracking-tight text-ink/60 transition-colors hover:text-ink"
          >
            Calendar
          </Link>
          <Link href="/clubs/apply" className="pill-btn px-4 py-2 text-[12px]">
            Start a club
          </Link>
        </nav>
      </div>
    </header>
  );
}
