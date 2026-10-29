import { HoneyJarIcon, type IconComponent } from "@/components/icons/honey-icons";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { cx } from "@/lib/cx";

export type ImagePlaceholderProps = {
  /**
   * When set, the box is exposed as an image with this accessible name
   * (use for content images). Omit for decorative slots: it is then hidden
   * from assistive tech.
   */
  label?: string;
  /** Small visible caption under the glyph, e.g. "Front view". */
  caption?: string;
  /** Glyph to show in the centre; defaults to a honey jar. */
  icon?: IconComponent;
  /** Tailwind aspect utility, e.g. "aspect-square", "aspect-[4/3]". */
  aspect?: string;
  /**
   * `tile`/`cream`/`honey`: warm light tiles (default `tile`).
   * `white`: on tinted sections. `dark`: inside brown bands.
   */
  tone?: "tile" | "cream" | "honey" | "white" | "dark";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  bordered?: boolean;
  iconSize?: "sm" | "md" | "lg" | "xl";
  /** Faint honeycomb texture behind the glyph. Off for tiny thumbnails. */
  texture?: boolean;
  className?: string;
};

// Soft radial "spotlight" so tiles read like product photography on a warm
// backdrop. Glyphs use the amber ink at reduced opacity: never pure honey on
// white (too low contrast to read as a shape).
const tones = {
  tile: "bg-tile bg-[radial-gradient(circle_at_50%_40%,#fff3d6_0%,transparent_70%)] text-primary-ink/45",
  cream: "bg-cream bg-[radial-gradient(circle_at_50%_40%,#fffaf0_0%,transparent_70%)] text-primary-ink/45",
  honey: "bg-primary-tint bg-[radial-gradient(circle_at_50%_40%,#fffaf0_0%,transparent_75%)] text-primary-ink/55",
  white: "bg-surface text-primary-ink/40",
  dark: "bg-on-dark/5 text-primary/45",
} as const;

const textures = {
  tile: "text-primary-ink/[0.07]",
  cream: "text-primary-ink/[0.08]",
  honey: "text-primary-ink/[0.09]",
  white: "text-primary-ink/[0.06]",
  dark: "text-primary/[0.08]",
} as const;

export const radii = { none: "", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" } as const;
const iconSizes = { sm: "size-5", md: "size-8", lg: "size-12", xl: "size-20" } as const;

/**
 * Stand-in for every photo slot until real photography is added. Keeps layout
 * and aspect ratios intact and matches the warm honey palette.
 */
export function ImagePlaceholder({
  label,
  caption,
  icon: Icon = HoneyJarIcon,
  aspect = "aspect-square",
  tone = "tile",
  rounded = "none",
  bordered = false,
  iconSize = "md",
  texture = true,
  className,
}: ImagePlaceholderProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  // A <span> (styled as flex) so it is valid inside buttons and links too.
  return (
    <span
      {...a11y}
      className={cx(
        "relative isolate flex flex-col items-center justify-center gap-2 overflow-hidden",
        aspect,
        tones[tone],
        radii[rounded],
        bordered && "border border-border",
        className,
      )}
    >
      {texture && <HoneycombPattern className={textures[tone]} />}
      <Icon className={iconSizes[iconSize]} strokeWidth={1.25} />
      {caption && (
        <span
          className={cx(
            "text-eyebrow font-semibold tracking-wide uppercase",
            tone === "dark" ? "text-on-dark-muted" : "text-primary-ink",
          )}
          aria-hidden="true"
        >
          {caption}
        </span>
      )}
    </span>
  );
}
