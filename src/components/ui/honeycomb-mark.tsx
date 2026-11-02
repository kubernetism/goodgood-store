import { useId } from "react";
import { cx } from "@/lib/cx";
import {
  CELL_CENTRES,
  DROP_PATH,
  SPARKS,
  TICK_PATH,
  VIEW_BOX,
  celebrateFillDelay,
  hexPoints,
  loaderFillDelay,
  popDelay,
  wavePath,
} from "./honeycomb-geometry";
// Styles: honeycomb-mark.css, inlined into globals.css.

const HEX = hexPoints();
const WAVE = wavePath();

type HoneycombMarkProps = {
  /** `loader` loops while waiting; `celebrate` builds, fills and seals the comb once. */
  variant?: "loader" | "celebrate";
  /** Rendered width and height in px (a size utility in `className` can override it). */
  size?: number;
  /** `honey` (default) for page surfaces; `ink` draws in currentColor, for honey buttons. */
  tone?: "honey" | "ink";
  /** Celebrate only: false renders the finished comb with no motion. */
  playing?: boolean;
  className?: string;
};

/**
 * Seven-cell honeycomb in SVG + CSS: server-renderable, no animation library.
 * Decorative: pair it with text, or use HoneycombLoader for a status message.
 */
export function HoneycombMark({ variant = "loader", size = 48, tone = "honey", playing = true, className }: HoneycombMarkProps) {
  // useId keeps clip-path and gradient ids unique when several combs share a page.
  const id = useId().replace(/[^\w-]/g, "");
  const hexId = `${id}-hex`;
  const waveId = `${id}-wave`;
  const clipId = `${id}-cell`;
  const gradientId = `${id}-honey`;
  const celebrate = variant === "celebrate";
  const honeyFill = tone === "ink" ? "currentColor" : `url(#${gradientId})`;

  return (
    <svg
      className={cx("hc", `hc--${variant}`, tone === "ink" && "hc--ink", celebrate && playing && "hc--play", className)}
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      aria-hidden="true"
    >
      {/* Each shape is defined once and reused by every cell: the comb also
          ships inside streamed fallbacks, so its markup is kept small. */}
      <defs>
        <polygon id={hexId} points={HEX} />
        <path id={waveId} d={WAVE} />
        <clipPath id={clipId}>
          <use href={`#${hexId}`} />
        </clipPath>
        {tone === "honey" && (
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7c948" />
            <stop offset="0.55" stopColor="#f5a800" />
            <stop offset="1" stopColor="#d98a06" />
          </linearGradient>
        )}
      </defs>
      {CELL_CENTRES.map(([x, y], cell) => {
        const parts = (
          <>
            <use href={`#${hexId}`} className="hc__wax" />
            <g clipPath={`url(#${clipId})`}>
              <g className="hc__level" style={{ animationDelay: celebrate ? celebrateFillDelay(cell) : loaderFillDelay(cell) }}>
                <use href={`#${waveId}`} className="hc__wave" fill={honeyFill} />
              </g>
            </g>
            <use href={`#${hexId}`} className="hc__outline" />
          </>
        );
        return (
          <g key={cell} transform={`translate(${x} ${y})`}>
            {/* The pop gets its own group: a CSS transform on the positioned
                group would replace its transform attribute and stack every
                cell in the centre. */}
            {celebrate ? <g className="hc__cell" style={{ animationDelay: popDelay(cell) }}>{parts}</g> : parts}
          </g>
        );
      })}
      {celebrate && (
        <>
          <path className="hc__tick" d={TICK_PATH} />
          <path className="hc__drop" d={DROP_PATH} />
        </>
      )}
    </svg>
  );
}

type HoneycombLoaderProps = {
  /** Announced once by screen readers. */
  label?: string;
  /** Show the label under the comb; otherwise it is visually hidden. */
  showLabel?: boolean;
  /** Fade in after 150 ms so fast loads never flash the loader. */
  delayed?: boolean;
  size?: number;
  tone?: "honey" | "ink";
  className?: string;
  labelClassName?: string;
};

/** The loader comb as a polite status message. */
export function HoneycombLoader({
  label = "Loading…",
  showLabel = false,
  delayed = true,
  size = 56,
  tone = "honey",
  className,
  labelClassName,
}: HoneycombLoaderProps) {
  return (
    <div role="status" className={cx("flex flex-col items-center gap-3", delayed && "hc-status--delayed", className)}>
      <HoneycombMark size={size} tone={tone} />
      <span className={showLabel ? cx("text-meta font-medium text-muted", labelClassName) : "sr-only"}>{label}</span>
    </div>
  );
}

/** Small hexagons that float up behind the celebration. Place inside a positioned, isolated band. */
export function HoneycombSparks() {
  return (
    <span aria-hidden="true" className="hc-sparks">
      {SPARKS.map((spark, index) => (
        <span
          key={index}
          className="hc-spark"
          style={{
            left: `${spark.left}%`,
            top: `${spark.top}%`,
            width: spark.size,
            height: Math.round(spark.size * 1.1),
            animationDelay: `${spark.delay}s`,
          }}
        />
      ))}
    </span>
  );
}
