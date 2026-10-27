import type { ComponentType, SVGProps } from "react";

/*
 * Honey-specific line icons drawn on Lucide's 24px grid (2px round strokes),
 * so they sit naturally next to lucide-react glyphs. Lucide has no bee, jar or
 * dipper. All are decorative: callers provide the accessible name.
 */

type HoneyIconProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & { strokeWidth?: number | string };

/** Anything that renders like a Lucide icon (lucide-react components or the ones below). */
export type IconComponent = ComponentType<{ className?: string; strokeWidth?: number | string }>;

function Glyph({ strokeWidth = 2, children, ...props }: HoneyIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HoneyJarIcon(props: HoneyIconProps) {
  return (
    <Glyph {...props}>
      <rect x="5" y="2.5" width="14" height="3.5" rx="1" />
      <path d="M6.5 6v1.2C5 8 4 9.5 4 11.2V18a3.5 3.5 0 0 0 3.5 3.5h9A3.5 3.5 0 0 0 20 18v-6.8c0-1.7-1-3.2-2.5-4V6" />
      <path d="M8.5 6v2.2a1 1 0 0 0 2 0V6" />
      <path d="m12 11.5 2.6 1.5v3L12 17.5 9.4 16v-3Z" />
    </Glyph>
  );
}

export function BeeIcon(props: HoneyIconProps) {
  return (
    <Glyph {...props}>
      <ellipse cx="12" cy="14.5" rx="4.25" ry="6" />
      <path d="M8 12.5h8M7.9 16h8.2" />
      <path d="M9.2 10C6.4 9.6 3.6 8 4 5.8 4.5 3.6 7.8 4.6 10 8.7" />
      <path d="M14.8 10c2.8-.4 5.6-2 5.2-4.2-.5-2.2-3.8-1.2-6 2.9" />
      <path d="m10.6 8.7-1.4-3M13.4 8.7l1.4-3" />
    </Glyph>
  );
}

export function HoneyDipperIcon(props: HoneyIconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 2.5 10 10" />
      <ellipse cx="14.5" cy="14.5" rx="3.75" ry="5.5" transform="rotate(-45 14.5 14.5)" />
      <path d="m11.3 15.6 4.3-4.3M13.4 17.7l4.3-4.3" />
      <path d="M19.5 19.5v2" />
    </Glyph>
  );
}

export function HoneycombIcon(props: HoneyIconProps) {
  return (
    <Glyph {...props}>
      <path d="m8 3.5 3.5 2v4L8 11.5l-3.5-2v-4Z" />
      <path d="m15.5 3.5 3.5 2v4l-3.5 2-3.5-2v-4Z" />
      <path d="m11.75 12.5 3.5 2v4l-3.5 2-3.5-2v-4Z" />
    </Glyph>
  );
}
