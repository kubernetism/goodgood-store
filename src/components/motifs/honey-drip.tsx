import { cx } from "@/lib/cx";

type HoneyDripProps = {
  /**
   * Height of the drip band. The tile keeps its aspect ratio, so taller sizes
   * mean bigger (not stretched) drops.
   */
  size?: "sm" | "md" | "lg";
  /** Set the colour with a text-* utility; the drip paints currentColor. */
  className?: string;
};

const heights = {
  sm: "h-8 sm:h-10",
  md: "h-10 sm:h-14",
  lg: "h-12 sm:h-16 lg:h-[4.5rem]",
} as const;

/**
 * Signature honey-drip edge. Place it directly under a block of the same
 * colour: its top 25% is solid, so it reads as that block melting downward.
 * Use sparingly (hero edge, the features strip). Purely decorative.
 *
 * The SVG tile lives in globals.css (`--mask-honey-drip`) and repeats with
 * `mask-repeat: round`, so drops are never sliced at the edges and never
 * squashed vertically on wide screens.
 */
export function HoneyDrip({ size = "md", className }: HoneyDripProps) {
  return <div aria-hidden="true" className={cx("mask-honey-drip pointer-events-none w-full", heights[size], className)} />;
}
