"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** One primary set: the clubs index, the wall, the calendar, and the one CTA. */
const NAV = [
  { href: "/clubs/roster", label: "The clubs" },
  { href: "/clubs/wall", label: "The wall" },
  { href: "/clubs/calendar", label: "Calendar" },
];

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "";

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

        <nav className="flex shrink-0 items-center gap-1 sm:gap-5" aria-label="Primary">
          {NAV.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`hidden min-h-[36px] items-center text-[13px] font-medium tracking-tight transition-colors sm:inline-flex ${
                  current
                    ? "text-ink underline decoration-ink/40 underline-offset-[6px]"
                    : "text-ink-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/clubs/apply" className="pill-btn inline-flex min-h-[36px] items-center px-4 py-2 text-[12px]">
            Start a club
          </Link>
        </nav>
      </div>
    </header>
  );
}
