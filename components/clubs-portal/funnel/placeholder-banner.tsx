export interface PlaceholderBannerProps {
  /** True while the rows behind the dashboard are sample or partial. */
  isPlaceholder: boolean;
  /** Optional one-line note from the dataset, shown alongside the warning. */
  note?: string;
}

/**
 * A plain, high-contrast band that renders only when the data is sample or
 * partial, so nobody reads placeholder numbers as real reach. Returns null
 * when `isPlaceholder` is false. Server component.
 */
export function PlaceholderBanner({ isPlaceholder, note }: PlaceholderBannerProps) {
  if (!isPlaceholder) return null;

  return (
    <div role="status" className="rounded-[8px] border-2 border-ink bg-surface px-4 py-3 sm:px-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
        Sample data — not real reach
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink">
        These numbers are sample or partial. Do not read them as real follower, signup or attendance
        counts.{note ? ` ${note}` : ""}
      </p>
    </div>
  );
}
