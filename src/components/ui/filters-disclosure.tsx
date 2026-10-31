"use client";

import { useId, useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cx } from "@/lib/cx";

type FiltersDisclosureProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * Collapsible on small screens, always expanded from `lg` up. Used for the
 * shop and blog sidebars so filters don't push results below the fold.
 */
export function FiltersDisclosure({ label, children, className }: FiltersDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-border-strong font-display text-sm font-semibold text-strong lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {isOpen ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      </button>
      <div id={panelId} className={cx("mt-6 lg:mt-0 lg:block", isOpen ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
}
