import type { ReactNode } from "react";

/**
 * The shared frame every portal section sits in. Each section owns its own file
 * (components/portal/funnel-section.tsx, expenses-section.tsx) and renders into
 * this, so the three parallel tracks never edit the same code.
 */
export function SectionFrame({
  id,
  owner,
  title,
  blurb,
  meta,
  actions,
  children,
}: {
  id: string;
  owner: string;
  title: string;
  blurb: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/15 pb-3">
        <div className="flex items-baseline gap-3">
          <span className="label">{owner}</span>
          <h2 className="font-serif text-[1.9rem] leading-none text-ink sm:text-[2.2rem]">{title}</h2>
        </div>
        {actions ?? null}
      </div>
      <p className="mt-3 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-2">{blurb}</p>
      {meta ? <div className="mt-4">{meta}</div> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

/** A dashed, clearly-labelled hole a parallel track fills in. */
export function SectionPlaceholder({
  headline,
  lines,
}: {
  headline: string;
  lines: string[];
}) {
  return (
    <div className="border border-dashed border-ink/30 bg-paper/60 px-5 py-8 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Slot open</p>
      <p className="font-serif mt-3 max-w-[46ch] text-[1.45rem] leading-tight text-ink">{headline}</p>
      <ul className="mt-4 flex max-w-[70ch] flex-col gap-2">
        {lines.map((line) => (
          <li key={line} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
            <span aria-hidden className="mt-[0.55em] h-[1px] w-3 shrink-0 bg-ink/40" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
