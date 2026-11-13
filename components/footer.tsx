export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paperdeep/60 pb-12 pt-14">
      <div className="mx-auto max-w-[1560px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink">
                FOUNDERS, INC.
              </span>
              <span aria-hidden className="text-ink-3">
                /
              </span>
              <span className="font-serif text-lg italic leading-none text-ink">Clubs</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-2">
              Tournaments, track days, workshops and field days for the Founders, Inc. campus at Fort
              Mason Pier 2, San Francisco.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label">Fort Mason Pier 2</span>
            <p className="font-mono text-[11px] leading-relaxed text-ink-2">
              Founders, Inc. Campus
              <br />
              Pier 2, Fort Mason Center
              <br />
              San Francisco, CA 94123
            </p>
            <div className="flex gap-4 font-mono text-[11px]">
              <a
                href="https://f.inc"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[36px] items-center text-ink-2 underline underline-offset-4 hover:text-ink"
              >
                f.inc ↗
              </a>
              <a
                href="https://f.inc/campus"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[36px] items-center text-ink-2 underline underline-offset-4 hover:text-ink"
              >
                Campus ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink/10 pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Founders, Inc. All rights reserved.</span>
          <span>Pier 2 · Fort Mason · San Francisco</span>
        </div>
      </div>
    </footer>
  );
}
