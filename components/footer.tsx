import Link from "next/link";
import { Scrap, Tape } from "@/components/collage/paper";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-paperdeep/70 pb-12 pt-16">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink">
                FOUNDERS, INC.
              </span>
              <span aria-hidden className="text-ink/30">
                /
              </span>
              <span className="font-serif text-lg italic leading-none text-ink/80">Clubs</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
              Private track days, workshop nights, competitive pickup, and tactical field days.
              Chartered by founders, subsidised at Fort Mason Pier 2, San Francisco.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 bg-ink/8 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/60">
                Season running · Pier 2
              </span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="label">On the wall</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/clubs/cars", label: "Car Club (Sonoma)" },
                { href: "/clubs/hardware", label: "Hardware Workshop" },
                { href: "/clubs/basketball", label: "Gymnasium Basketball" },
                { href: "/clubs/paintball", label: "Tactical Paintball" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink/70 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="label">Fort Mason Pier 2</h4>
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink/60">
              Founders, Inc. Campus
              <br />
              Pier 2, Fort Mason Center
              <br />
              San Francisco, CA 94123
            </p>
            <div className="mt-5 flex gap-4 font-mono text-[11px]">
              <a
                href="https://f.inc"
                target="_blank"
                rel="noreferrer"
                className="text-ink/60 underline underline-offset-4 hover:text-ink"
              >
                f.inc ↗
              </a>
              <a
                href="https://f.inc/campus"
                target="_blank"
                rel="noreferrer"
                className="text-ink/60 underline underline-offset-4 hover:text-ink"
              >
                Campus ↗
              </a>
            </div>
          </div>
        </div>

        <div className="relative mt-14 flex flex-col items-start justify-between gap-4 pt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Founders, Inc. All rights reserved.</span>
          <span>Pier 2 · Fort Mason · San Francisco</span>
        </div>

        <div className="relative mt-10 hidden h-24 sm:block">
          <Scrap
            tone="news"
            rotate={-1.2}
            className="absolute left-0 top-0 w-[290px] px-4 py-2"
          >
            <Tape className="-top-3 left-6" rotate={-18} width={70} height={24} />
            <p className="scrawl text-[15px] leading-tight text-ink/80">
              the wall gets re-pinned every season.
            </p>
          </Scrap>
        </div>
      </div>
    </footer>
  );
}
