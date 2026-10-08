import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-subtle transition-colors">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-6 py-16 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink text-paper font-mono text-xs font-semibold tracking-tighter">
              f.
            </div>
            <span className="font-serif text-3xl leading-none text-ink">Clubs</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Founders, Inc. · Fort Mason Center, Pier 2 · San Francisco, CA
          </p>
          <p className="mt-1 font-mono text-xs text-muted/70">
            A gathering ground for makers, drivers, athletes, and builders.
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink/80" aria-label="Footer">
            <Link href="/clubs" className="hover:text-ink hover:underline underline-offset-4">
              Overview
            </Link>
            <Link href="/clubs/calendar" className="hover:text-ink hover:underline underline-offset-4">
              Calendar
            </Link>
            <Link href="/clubs/apply" className="hover:text-ink hover:underline underline-offset-4">
              Start a Club
            </Link>
            <a
              href="https://f.inc"
              className="hover:text-ink hover:underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              f.inc ↗
            </a>
            <a
              href="https://f.inc/campus"
              className="hover:text-ink hover:underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              Campus ↗
            </a>
          </nav>
        </div>
      </div>
      <div className="border-t border-line/60 py-4 px-6 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-muted/60">
          <p>© {new Date().getFullYear()} Founders, Inc. All rights reserved.</p>
          <p>San Francisco, California</p>
        </div>
      </div>
    </footer>
  );
}
