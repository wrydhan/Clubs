"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portal/funnel", label: "Funnel" },
  { href: "/portal/people", label: "People" },
  { href: "/portal/spend", label: "Spend" },
  { href: "/portal/planning", label: "What's next" },
] as const;

/** Tab bar. One route per tab, so nothing shares a page with anything else. */
export function PortalTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portal sections"
      className="mt-6 flex gap-1 overflow-x-auto rounded-[12px] border border-white/8 bg-[#111113] p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 whitespace-nowrap rounded-[9px] px-4 py-2 text-center text-[13px] transition-colors ${
              active
                ? "bg-white font-medium text-[#0b0b0c]"
                : "text-ink-soft hover:bg-white/6 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
