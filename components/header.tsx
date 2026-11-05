import Link from "next/link";

import { HeaderNav } from "@/components/header-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/clubs"
            aria-label="Founders, Inc. Clubs home"
            className="group flex min-h-[36px] min-w-0 items-center gap-1.5 sm:gap-2"
          >
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

        <HeaderNav />
      </div>
    </header>
  );
}
