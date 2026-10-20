import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/clubs" className="group flex min-h-[36px] min-w-0 items-center gap-1.5 sm:gap-2">
            <span className="whitespace-nowrap font-mono text-[10px] font-semibold tracking-[0.12em] text-ink sm:text-[11px] sm:tracking-[0.16em]">
              FOUNDERS, INC.
            </span>
            <span aria-hidden className="text-ink-3">
              /
            </span>
            <span className="font-serif text-lg italic leading-none text-ink transition-colors group-hover:text-ink">
              Clubs
            </span>
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 lg:inline">
            Pier 2 · Fort Mason, SF
          </span>
        </div>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-5">
          <Link
            href="/clubs"
            className="hidden min-h-[36px] items-center text-[13px] font-medium tracking-tight text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            The wall
          </Link>
          <Link
            href="/clubs/cars"
            className="hidden min-h-[36px] items-center text-[13px] font-medium tracking-tight text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            Car Club
          </Link>
          <Link
            href="/clubs/calendar"
            className="inline-flex min-h-[36px] items-center text-[13px] font-medium tracking-tight text-ink-2 transition-colors hover:text-ink"
          >
            Calendar
          </Link>
          <Link href="/clubs/apply" className="pill-btn inline-flex min-h-[36px] items-center px-4 py-2 text-[12px]">
            Start a club
          </Link>
        </nav>
      </div>
    </header>
  );
}
