import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#F1F1F1] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs font-semibold tracking-widest text-black">
                FOUNDERS, INC.
              </span>
              <span className="text-black/30 text-xs">/</span>
              <span className="font-serif italic text-base text-black/70">
                Clubs
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-black/60 leading-relaxed font-sans">
              Private track days, hardware machining, competitive pickup, and tactical scenario runs.
              Chartered by founders, subsidized and supported at Fort Mason Pier 2, San Francisco.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-black/50">
                Season Active · Pier 2 Campus
              </span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-black/40">
              Campus Clubs
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/clubs/cars" className="text-black/70 hover:text-black transition-colors">
                  Car Club (Sonoma Raceway)
                </Link>
              </li>
              <li>
                <Link href="/clubs/hardware" className="text-black/70 hover:text-black transition-colors">
                  Hardware Prototyping Lab
                </Link>
              </li>
              <li>
                <Link href="/clubs/basketball" className="text-black/70 hover:text-black transition-colors">
                  Gymnasium Pickup Basketball
                </Link>
              </li>
              <li>
                <Link href="/clubs/paintball" className="text-black/70 hover:text-black transition-colors">
                  Tactical Woodsball
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-black/40">
              Fort Mason Pier 2
            </h4>
            <p className="mt-4 text-xs font-mono text-black/60 leading-relaxed">
              Founders, Inc. Campus<br />
              Pier 2, Fort Mason Center<br />
              San Francisco, CA 94123
            </p>
            <div className="mt-6 flex gap-4 text-xs font-mono">
              <a
                href="https://f.inc"
                target="_blank"
                rel="noreferrer"
                className="text-black/60 hover:text-black underline underline-offset-4"
              >
                f.inc ↗
              </a>
              <a
                href="https://f.inc/campus"
                target="_blank"
                rel="noreferrer"
                className="text-black/60 hover:text-black underline underline-offset-4"
              >
                Campus ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-black/40">
          <span>© {new Date().getFullYear()} Founders, Inc. All rights reserved.</span>
          <span>Pier 2 · Fort Mason · San Francisco</span>
        </div>
      </div>
    </footer>
  );
}
