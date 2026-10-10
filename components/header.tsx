import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/clubs" className="flex items-baseline gap-2 group">
            <span className="font-mono text-xs font-semibold tracking-widest text-black">
              FOUNDERS, INC.
            </span>
            <span className="text-black/30 text-xs">/</span>
            <span className="font-serif italic text-base text-black/70 group-hover:text-black transition-colors">
              Clubs
            </span>
          </Link>
          <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider text-black/40 pl-2">
            Pier 2 · Fort Mason, SF
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/clubs"
            className="text-sm font-medium tracking-tight text-black/60 hover:text-black transition-colors"
          >
            Roster
          </Link>
          <Link
            href="/clubs/cars"
            className="text-sm font-medium tracking-tight text-black/60 hover:text-black transition-colors"
          >
            Car Club
          </Link>
          <Link
            href="/clubs/calendar"
            className="text-sm font-medium tracking-tight text-black/60 hover:text-black transition-colors"
          >
            Calendar
          </Link>
          <Link
            href="/clubs/apply"
            className="pill-btn text-xs py-2 px-4 font-medium"
          >
            Start a Club
          </Link>
        </nav>
      </div>
    </header>
  );
}
