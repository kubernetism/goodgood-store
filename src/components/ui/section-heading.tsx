import type { ReactNode } from "react";
import { HoneyDivider } from "@/components/motifs/honey-divider";
import { cx } from "@/lib/cx";

type EyebrowProps = {
  children: ReactNode;
  /** Adds a short rule before (and optionally after) the text. */
  decorated?: "both" | "leading" | false;
  tone?: "light" | "dark";
  className?: string;
};

/** Small uppercase label above headings: amber ink on light, honey on brown bands. */
export function Eyebrow({ children, decorated = false, tone = "light", className }: EyebrowProps) {
  const rule = <span aria-hidden="true" className="h-px w-6 bg-current opacity-60" />;
  return (
    <p
      className={cx(
        "inline-flex items-center gap-3 font-subtitle text-eyebrow font-bold uppercase",
        tone === "dark" ? "text-primary" : "text-primary-ink",
        className,
      )}
    >
      {decorated && rule}
      {children}
      {decorated === "both" && rule}
    </p>
  );
}

type SectionHeadingProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  eyebrowDecoration?: "both" | "leading";
  /** Optional supporting line under the title. */
  description?: ReactNode;
  id?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
};

/** Sansation title and subtitle with the existing hexagon divider. */
export function SectionHeading({
  title,
  eyebrow,
  eyebrowDecoration = "both",
  description,
  id,
  align = "center",
  tone = "light",
  className,
}: SectionHeadingProps) {
  const isCentered = align === "center";
  return (
    <div className={cx(isCentered && "text-center", className)}>
      {eyebrow && (
        <Eyebrow decorated={eyebrowDecoration} tone={tone} className="mb-3">
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        id={id}
        className={cx("font-heading text-h2-sm font-semibold lg:text-h2", tone === "dark" && "text-on-dark")}
      >
        {title}
      </h2>
      <HoneyDivider tone={tone} className={cx("mt-4", isCentered && "mx-auto")} />
      {description && (
        <p
          className={cx(
            "mt-4 max-w-xl font-subtitle text-pretty",
            isCentered && "mx-auto",
            tone === "dark" ? "text-on-dark-muted" : "text-body",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
