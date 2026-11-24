import type { ReactNode } from "react";

/**
 * Hand-rolled charts: plain SVG and divs, no chart library, no client JS.
 * Everything is monochrome on the dark surface — length and position carry the
 * reading, not hue.
 */

export function BarList({
  rows,
}: {
  rows: Array<{ label: string; value: number; note?: string }>;
}) {
  const max = rows.reduce((m, row) => Math.max(m, row.value), 0);
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12.5px] text-ink">{row.label}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-[14px] font-medium tabular-nums text-ink">
                {row.value.toLocaleString("en-US")}
              </span>
              {row.note ? (
                <span className="font-mono text-[10px] text-ink-soft">{row.note}</span>
              ) : null}
            </span>
          </div>
          <span className="mt-1.5 block h-2 w-full overflow-hidden rounded-full bg-white/8">
            <span
              className="block h-full rounded-full bg-white/85"
              style={{ width: `${max > 0 ? (row.value / max) * 100 : 0}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

const RING_COLORS = ["#f5f5f5", "rgba(245,245,245,0.66)", "rgba(245,245,245,0.42)", "rgba(245,245,245,0.26)", "rgba(245,245,245,0.16)"];

export function Donut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: Array<{ label: string; value: number }>;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Dash offsets computed up front so nothing is mutated during render.
  const segments = slices.reduce<Array<{ label: string; value: number; dash: number; offset: number }>>(
    (acc, slice) => {
      const previous = acc[acc.length - 1];
      const start = previous ? previous.offset + previous.dash : 0;
      const dash = total > 0 ? (slice.value / total) * circumference : 0;
      acc.push({ label: slice.label, value: slice.value, dash, offset: start });
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-[140px] w-[140px] shrink-0 -rotate-90" role="img" aria-label="Share by source">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        {segments.map((segment, index) => {
          if (segment.dash === 0) return null;
          return (
            <circle
              key={segment.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={RING_COLORS[index % RING_COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            />
          );
        })}
        {centerValue ? (
          <text
            x="70"
            y="66"
            textAnchor="middle"
            className="rotate-90"
            transform="rotate(90 70 70)"
            style={{ fill: "#f5f5f5", fontSize: 20, fontWeight: 600 }}
          >
            {centerValue}
          </text>
        ) : null}
        {centerLabel ? (
          <text
            x="70"
            y="84"
            textAnchor="middle"
            transform="rotate(90 70 70)"
            style={{ fill: "rgba(255,255,255,0.45)", fontSize: 7, letterSpacing: 1.4 }}
          >
            {centerLabel.toUpperCase()}
          </text>
        ) : null}
      </svg>

      <ul className="min-w-[160px] flex-1 space-y-2">
        {slices.map((slice, index) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="flex items-center gap-2 text-ink">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ background: RING_COLORS[index % RING_COLORS.length] }}
              />
              {slice.label}
            </span>
            <span className="tabular-nums text-ink-soft">
              {slice.value}
              {total > 0 ? <span className="ml-1 text-[10px]">{Math.round((slice.value / total) * 100)}%</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GroupedBars({
  rows,
  firstLabel,
  secondLabel,
}: {
  rows: Array<{ label: string; first: number; second: number | null }>;
  firstLabel: string;
  secondLabel: string;
}) {
  const max = rows.reduce((m, row) => Math.max(m, row.first, row.second ?? 0), 0);
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-[2px] bg-white/85" /> {firstLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-[2px] bg-white/30" /> {secondLabel}
        </span>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[12.5px] text-ink">{row.label}</span>
            </div>
            <div className="mt-1.5 space-y-1">
              <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                <span
                  className="block h-full rounded-full bg-white/85"
                  style={{ width: `${max > 0 ? (row.first / max) * 100 : 0}%` }}
                />
              </span>
              <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                <span
                  className="block h-full rounded-full bg-white/30"
                  style={{ width: `${max > 0 && row.second ? (row.second / max) * 100 : 0}%` }}
                />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
