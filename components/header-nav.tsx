"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Primary destinations. The roster link is "The clubs" so its label never
 *  collides with the brand link, which is also the clubs home. */
const NAV = [
  { href: "/clubs/wall", label: "The wall", show: "hidden sm:inline-flex" },
  { href: "/clubs/roster", label: "The clubs", show: "hidden sm:inline-flex" },
  { href: "/clubs/calendar", label: "Calendar", show: "hidden md:inline-flex" },
];

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/clubs") return pathname === "/clubs";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Primary" className="flex shrink-0 items-center gap-1 sm:gap-5">
      {NAV.map((item) => {
        const current = isCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`${item.show} min-h-[36px] items-center text-[13px] font-medium tracking-tight transition-colors hover:text-ink ${
              current ? "text-ink underline decoration-ink/30 underline-offset-4" : "text-ink-2"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/clubs/apply"
        aria-current={isCurrent(pathname, "/clubs/apply") ? "page" : undefined}
        className="pill-btn inline-flex min-h-[36px] items-center px-4 py-2 text-[12px]"
      >
        Start a club
      </Link>
    </nav>
  );
}
