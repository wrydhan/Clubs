import Link from "next/link";
import { subscribeUrl } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1560px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex min-h-[36px] min-w-0 items-center gap-2">
          <span className="whitespace-nowrap font-mono text-[10px] font-semibold tracking-[0.12em] text-ink sm:text-[11px] sm:tracking-[0.16em]">
            FOUNDERS, INC.
          </span>
          <span aria-hidden className="text-ink-3">
            /
          </span>
          <span className="font-serif text-lg italic leading-none text-ink">Clubs</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-5">
          <a
            href="#calendar"
            className="hidden min-h-[36px] items-center text-[13px] font-medium tracking-tight text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            Calendar
          </a>
          <a
            href={subscribeUrl}
            target="_blank"
            rel="noreferrer"
            className="pill-btn inline-flex min-h-[36px] items-center px-4 py-2 text-[12px]"
          >
            Subscribe
          </a>
        </nav>
      </div>
    </header>
  );
}
