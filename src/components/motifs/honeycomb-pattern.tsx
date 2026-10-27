import { cx } from "@/lib/cx";

type HoneycombPatternProps = {
  /** `fade` keeps the left (copy) side clean and lets the comb build to the right. */
  fade?: boolean;
  /** Colour and opacity via text-* utilities, e.g. "text-primary/10". */
  className?: string;
};

/**
 * Subtle hexagon texture that fills its nearest positioned ancestor. The
 * parent needs `relative isolate` (the texture sits at -z-10). Decorative.
 */
export function HoneycombPattern({ fade = false, className }: HoneycombPatternProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute inset-0 -z-10",
        fade ? "mask-honeycomb-fade" : "mask-honeycomb",
        className,
      )}
    />
  );
}
