import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6 md:px-10">
        <Link href="/clubs" className="group flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink text-paper font-mono text-xs font-semibold tracking-tighter">
            f.
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted leading-none">
              Founders, Inc.
            </span>
            <span className="font-serif text-[1.4rem] leading-none text-ink tracking-tight group-hover:text-accent transition-colors">
              Clubs
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-[14px] font-medium" aria-label="Primary">
            <Link
              href="/clubs"
              className="text-ink/80 hover:text-ink transition-colors hover:underline underline-offset-4"
            >
              Overview
            </Link>
            <Link
              href="/clubs/calendar"
              className="text-ink/80 hover:text-ink transition-colors hover:underline underline-offset-4"
            >
              Calendar
            </Link>
            <Link
              href="/clubs/apply"
              className="text-ink/80 hover:text-ink transition-colors hover:underline underline-offset-4"
            >
              Start a Club
            </Link>
          </nav>
          <div className="hidden sm:flex items-center gap-2 border-l border-line pl-6">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Fort Mason, SF
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
