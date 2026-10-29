import Link from "next/link";
import Image from "next/image";
import brandLogo from "../../../images/logo/abdulSamiEnterprisesLogo.png";
import { siteConfig } from "@/lib/site";
import { cx } from "@/lib/cx";

type LogoProps = {
  /** `light` for ivory/honey surfaces (brown ink); `dark` for brown bands (cream ink). */
  tone?: "light" | "dark";
  className?: string;
  /** Keep the narrow mobile navigation clear; the footer retains the name. */
  compact?: boolean;
};

/**
 * The supplied company mark with a Sansation wordmark. The link's accessible
 * name remains the full company name, even when mobile uses only the mark.
 */
export function Logo({ tone = "light", className, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cx(
        "inline-flex items-center gap-3 rounded-sm",
        tone === "dark" ? "text-on-dark" : "text-strong",
        className,
      )}
    >
      <Image src={brandLogo} alt="" sizes="56px" className="h-14 w-14 shrink-0 object-contain" />
      <span aria-hidden="true" className={cx("font-heading leading-tight", compact && "hidden sm:block")}>
        <span className="block text-lg font-bold">Abdul Sami</span>
        <span className="block text-xs font-semibold">Honey Enterprises</span>
      </span>
      <span className="sr-only">{siteConfig.legalName}</span>
    </Link>
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
