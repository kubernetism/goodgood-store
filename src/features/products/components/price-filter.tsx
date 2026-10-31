"use client";

import Form from "next/form";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { formatRupees } from "@/lib/format";

type PriceFilterProps = {
  /** Whole rupees, multiples of `step`. */
  bounds: { min: number; max: number };
  /** Slider granularity in whole rupees. */
  step: number;
  /** Current selection in whole rupees (null = unbounded). */
  minPrice: number | null;
  maxPrice: number | null;
  /** Other active params to carry through the GET submission. */
  preserved: Record<string, string>;
};

/**
 * Dual-thumb price range. Submits as a GET form to /shop so it works without
 * JavaScript and the filter state lives in the URL (shareable, back-button safe).
 */
export function PriceFilter({ bounds, step, minPrice, maxPrice, preserved }: PriceFilterProps) {
  const [low, setLow] = useState(minPrice ?? bounds.min);
  const [high, setHigh] = useState(maxPrice ?? bounds.max);

  const span = bounds.max - bounds.min || 1;
  const lowPercent = ((low - bounds.min) / span) * 100;
  const highPercent = ((high - bounds.min) / span) * 100;

  return (
    <Form action="/shop" className="space-y-5">
      {Object.entries(preserved).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <p className="flex items-center justify-between font-display text-sm font-semibold text-strong">
        <span>Your Range</span>
        <output htmlFor="price-min price-max" aria-live="polite">
          {formatRupees(low)} – {formatRupees(high)}
        </output>
      </p>

      <div className="dual-range relative h-5">
        {/* Track: thin brown base with the selected span as a thicker honey bar outlined in brown. */}
        <div aria-hidden="true" className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-border-strong" />
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full border border-strong bg-primary"
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <label htmlFor="price-min" className="sr-only">
          Minimum price in rupees
        </label>
        <input
          id="price-min"
          type="range"
          name="min"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={low}
          aria-valuetext={formatRupees(low)}
          onChange={(event) => setLow(Math.min(Number(event.target.value), high))}
        />
        <label htmlFor="price-max" className="sr-only">
          Maximum price in rupees
        </label>
        <input
          id="price-max"
          type="range"
          name="max"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={high}
          aria-valuetext={formatRupees(high)}
          onChange={(event) => setHigh(Math.max(Number(event.target.value), low))}
        />
      </div>

      <button type="submit" className={buttonClasses({ variant: "dark", size: "sm", className: "w-full" })}>
        Filter
      </button>
    </Form>
  );
}
