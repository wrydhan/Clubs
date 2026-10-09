import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#e5e2da] bg-[#f9f8f5] dark:border-[#262626] dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs font-semibold tracking-widest text-[#0a0a0a] dark:text-[#f9f8f5]">
                FOUNDERS, INC.
              </span>
              <span className="text-[#a3a3a3] text-xs">/</span>
              <span className="font-serif italic text-sm text-[#404040] dark:text-[#a3a3a3]">
                Clubs
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-[#737373] leading-relaxed">
              Subsidized spaces, track days, court time, and hardware labs for founders in the Bay Area.
              Run by members at Fort Mason Pier 2, San Francisco.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 font-mono text-xs">
              <li>
                <Link href="/clubs" className="text-[#404040] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#f9f8f5] transition-colors">
                  Roster
                </Link>
              </li>
              <li>
                <Link href="/clubs/calendar" className="text-[#404040] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#f9f8f5] transition-colors">
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/clubs/apply" className="text-[#404040] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#f9f8f5] transition-colors">
                  Start a Club
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              Campus
            </h4>
            <p className="mt-4 font-mono text-xs text-[#737373] leading-relaxed">
              Pier 2, Fort Mason Center<br />
              San Francisco, CA 94123<br />
              lab@f.inc
            </p>
            <div className="mt-4 flex gap-4 font-mono text-xs">
              <a
                href="https://f.inc"
                target="_blank"
                rel="noreferrer"
                className="text-[#404040] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#f9f8f5] transition-colors"
              >
                f.inc ↗
              </a>
              <a
                href="https://f.inc/campus"
                target="_blank"
                rel="noreferrer"
                className="text-[#404040] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#f9f8f5] transition-colors"
              >
                Campus ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e5e2da] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-[#737373] dark:border-[#262626]">
          <span>© {new Date().getFullYear()} Founders, Inc.</span>
          <span>Fort Mason · San Francisco</span>
        </div>
      </div>
    </footer>
  );
}
