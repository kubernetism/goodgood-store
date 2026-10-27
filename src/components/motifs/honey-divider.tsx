import { cx } from "@/lib/cx";

type HoneyDividerProps = {
  tone?: "light" | "dark";
  className?: string;
};

/** Pointy-top hexagon path centred on (x, 8) in the 120x16 viewBox. */
function hexagon(x: number, radius = 6) {
  const half = radius * 0.866;
  return `M${x} ${8 - radius}l${half} ${radius / 2}v${radius}L${x} ${8 + radius}l${-half} ${-radius / 2}v${-radius}Z`;
}

/**
 * Small "line — hexagon cluster — line" ornament under section headings.
 * The honey fill always sits inside a brown (or cream) outline, so the shape
 * keeps 3:1 contrast on white and on brown bands. Decorative.
 */
export function HoneyDivider({ tone = "light", className }: HoneyDividerProps) {
  return (
    <svg
      viewBox="0 0 120 16"
      aria-hidden="true"
      focusable="false"
      className={cx("h-4 w-28", tone === "dark" ? "text-on-dark-muted" : "text-primary-ink", className)}
    >
      <path d="M4 8h36M80 8h36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d={hexagon(49, 4.5)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={hexagon(60)} fill="#ffb800" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={hexagon(71, 4.5)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
