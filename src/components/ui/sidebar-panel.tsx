import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type SidebarPanelProps = {
  title: string;
  children: ReactNode;
  /** `bar`: cream title bar (shop). `accent`: honey hexagon + title in a bordered box (blog). */
  variant?: "bar" | "accent";
  className?: string;
};

function HexBullet() {
  return (
    <svg viewBox="0 0 12 14" aria-hidden="true" focusable="false" className="h-3.5 w-3 shrink-0">
      <path d="m6 1 5 3v6l-5 3-5-3V4Z" fill="#ffb800" stroke="#2b1d0e" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Titled sidebar section used by the shop, product and blog sidebars. */
export function SidebarPanel({ title, children, variant = "bar", className }: SidebarPanelProps) {
  if (variant === "accent") {
    return (
      <section className={cx("rounded-md border border-border p-5", className)}>
        <h2 className="mb-5 flex items-center gap-3 font-subtitle text-sm font-bold">
          <HexBullet />
          {title}
        </h2>
        {children}
      </section>
    );
  }

  return (
    <section className={cx("overflow-hidden rounded-md border border-border bg-surface", className)}>
      <h2 className="flex items-center gap-3 bg-panel px-5 py-3 font-subtitle text-base font-bold">
        <HexBullet />
        {title}
      </h2>
      <div className="p-4 sm:px-5">{children}</div>
    </section>
  );
}
