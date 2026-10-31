"use client";

import { Minus, Plus } from "lucide-react";
import { cx } from "@/lib/cx";

type QuantityStepperProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  /** Accessible label, e.g. "Quantity of Papaya". */
  label: string;
  size?: "md" | "sm";
};

/** − [n] + control. Values are clamped to [min, max]. */
export function QuantityStepper({ id, value, onChange, min = 1, max, label, size = "md" }: QuantityStepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const buttonClass = cx(
    "flex items-center justify-center text-strong transition-colors duration-200 hover:bg-tile disabled:text-muted disabled:hover:bg-transparent",
    size === "md" ? "w-11" : "w-9",
  );

  return (
    <div className={cx("flex items-stretch overflow-hidden rounded-full border border-border-strong", size === "md" ? "h-12" : "h-10")}>
      <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} className={buttonClass}>
        <Minus className="size-4" aria-hidden="true" />
        <span className="sr-only">Decrease quantity</span>
      </button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(next) ? min : clamp(next));
        }}
        className={cx(
          "border-x border-border-strong text-center font-display font-semibold text-strong [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          size === "md" ? "w-12" : "w-10 text-sm",
        )}
      />
      <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} className={buttonClass}>
        <Plus className="size-4" aria-hidden="true" />
        <span className="sr-only">Increase quantity</span>
      </button>
    </div>
  );
}
