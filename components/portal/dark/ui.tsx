import type { ReactNode } from "react";

/**
 * Plain dark-mode building blocks for the portal. Deliberately dumb: no client
 * hooks, no data access. The portal's dark tokens live in globals.css under
 * `.portal-dark`, so everything here resolves to the same neutral ramp.
 */

export function PageTitle({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">{eyebrow}</p>
        <h1 className="mt-1.5 font-serif text-[2.1rem] leading-none text-ink sm:text-[2.6rem]">{title}</h1>
      </div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function Card({
  title,
  hint,
  className = "",
  children,
}: {
  title?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[14px] border border-white/8 bg-[#141416] p-4 sm:p-5 ${className}`}>
      {title ? (
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-medium tracking-tight text-ink">{title}</h2>
          {hint ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{hint}</span>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  note,
  tone = "plain",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "plain" | "strong" | "dim";
}) {
  return (
    <div
      className={`rounded-[14px] border p-4 ${
        tone === "strong"
          ? "border-white/15 bg-white text-[#0b0b0c]"
          : tone === "dim"
            ? "border-white/6 bg-[#111113]"
            : "border-white/8 bg-[#141416]"
      }`}
    >
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
          tone === "strong" ? "text-black/55" : "text-ink-soft"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-[1.7rem] leading-none font-semibold tabular-nums tracking-tight">{value}</p>
      {note ? (
        <p
          className={`mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
            tone === "strong" ? "text-black/50" : "text-ink-soft"
          }`}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function Meter({
  value,
  max,
  tone = "ink",
}: {
  value: number;
  max: number;
  tone?: "ink" | "dim" | "accent";
}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0;
  const fill =
    tone === "dim" ? "bg-white/28" : tone === "accent" ? "bg-[#7cc4a4]" : "bg-white/85";
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full bg-white/8">
      <span className={`block h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </span>
  );
}

export function Chip({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "solid" | "outline";
}) {
  const cls =
    tone === "solid"
      ? "bg-white text-[#0b0b0c]"
      : tone === "outline"
        ? "border border-white/25 text-ink-soft"
        : "bg-white/8 text-ink-soft";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${cls}`}
    >
      {children}
    </span>
  );
}

/** Collapsible editor drawer: the numbers stay visible, the forms stay folded. */
export function Drawer({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group rounded-[14px] border border-white/8 bg-[#111113] px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] text-ink">
        <span>{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft group-open:hidden">
          open
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft group-open:inline">
          close
        </span>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}
