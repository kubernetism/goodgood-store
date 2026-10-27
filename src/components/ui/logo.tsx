import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cx } from "@/lib/cx";

type LogoProps = {
  /** `light` for ivory/honey surfaces (brown ink); `dark` for brown bands (cream ink). */
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Honey-jar mark + "Honey" script wordmark with a "by Abdul Sami" line, linking
 * home. One inline SVG; the visible lettering is decorative and the link's
 * accessible name is the full brand name.
 */
export function Logo({ tone = "light", className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cx(
        "inline-flex items-center rounded-sm",
        tone === "dark" ? "text-on-dark" : "text-strong",
        className,
      )}
    >
      <BrandLockup tone={tone} className="h-12 w-auto" />
      <span className="sr-only">{siteConfig.legalName}</span>
    </Link>
  );
}

function BrandLockup({ tone, className }: { tone: "light" | "dark"; className?: string }) {
  // Logotypes are exempt from contrast minimums, but these still clear 4.5:1.
  const tagline = tone === "dark" ? "#ffb800" : "#4a331a";

  return (
    <svg viewBox="0 0 172 52" aria-hidden="true" focusable="false" className={className}>
      <HoneyJarMark />
      {/* textLength pins the width, so the fallback font can't change the layout before Parisienne loads. */}
      <text
        x="46"
        y="31"
        textLength="104"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        className="font-script"
        fontSize="38"
      >
        Honey
      </text>
      {/* Ends before the descender of the script "y". */}
      <text
        x="48"
        y="47"
        textLength="74"
        lengthAdjust="spacingAndGlyphs"
        fill={tagline}
        className="font-sans"
        fontSize="8"
        fontWeight="600"
        letterSpacing="1.2"
      >
        BY ABDUL SAMI
      </text>
    </svg>
  );
}

/** Brown-outlined jar of honey with a drip off the lid and a hexagon label. */
export function HoneyJarMark({ className }: { className?: string }) {
  return (
    <g className={className}>
      {/* Lid */}
      <rect x="6" y="5" width="28" height="7" rx="2" fill="currentColor" />
      {/* Jar */}
      <path
        d="M9.5 12v2.6C6 16.6 4 20 4 24.5V37a9 9 0 0 0 9 9h14a9 9 0 0 0 9-9V24.5c0-4.5-2-7.9-5.5-9.9V12Z"
        fill="#ffb800"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      {/* Highlight */}
      <path d="M8.5 25c0-3 1.2-5.2 3.5-6.6v19.3A6 6 0 0 1 8.5 33Z" fill="#fff3d6" opacity="0.75" />
      {/* Drip from the lid */}
      <path d="M22 12v7.2a2.3 2.3 0 0 0 4.6 0V12Z" fill="#e89b0c" />
      {/* Hexagon label */}
      <path
        d="m20 26.5 5.2 3v6L20 38.5l-5.2-3v-6Z"
        fill="#fff8ec"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </g>
  );
}
