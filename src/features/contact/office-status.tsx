"use client";

import { useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import {
  describeStatusLong,
  describeStatusShort,
  formatClock,
  formatOpeningHours,
  getBusinessStatus,
  type BusinessStatus,
  type OpeningHours,
} from "./business-hours";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** The current minute: a stable primitive, so React re-renders once a minute at most. */
const currentMinute = () => Math.floor(Date.now() / MINUTE);

/**
 * Live status in Pakistan time, or null while prerendering and hydrating.
 * The server snapshot is null, so the static shell (built once under Cache
 * Components) shows plain office hours and hydration never mismatches.
 */
function useBusinessStatus(hours: OpeningHours): BusinessStatus | null {
  const minute = useSyncExternalStore<number | null>(subscribe, currentMinute, () => null);
  return minute === null ? null : getBusinessStatus(hours, new Date(minute * MINUTE));
}

function StatusDot({ status, tone }: { status: BusinessStatus | null; tone: "light" | "dark" }) {
  const isOpen = status !== null && status.state !== "closed";
  return (
    <span
      aria-hidden="true"
      className={cx(
        "status-dot",
        isOpen ? "status-dot--open bg-primary ring-2" : "ring-2",
        tone === "light" ? (isOpen ? "ring-strong" : "ring-muted") : isOpen ? "ring-on-dark" : "ring-on-dark-muted",
      )}
    />
  );
}

type OfficeStatusProps = { hours: OpeningHours };

/** Hanging "open / closed" door sign for the contact hero (tablet and up). */
export function OfficeSign({ hours }: OfficeStatusProps) {
  const status = useBusinessStatus(hours);
  const live = status !== null;

  return (
    <aside aria-label="Office hours status" className="relative w-56 pt-10 lg:w-64">
      <div className="office-sign relative" data-live={live || undefined}>
        {/* Nail and strings swing with the card around the nail. */}
        <svg viewBox="0 0 160 40" aria-hidden="true" focusable="false" className="absolute inset-x-0 -top-10 h-10 w-full overflow-visible text-on-dark-muted">
          <path d="M80 6 26 40M80 6l54 34" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.25" fill="none" />
          <path d="m80 1 4.3 2.5v5L80 11l-4.3-2.5v-5Z" fill="#ffb800" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
        <div className="office-sign__card on-light min-h-[11rem] rounded-md border-t-4 border-primary bg-ivory p-5 text-strong lg:p-6">
          <div className="office-sign__content" key={live ? "live" : "static"}>
            <p className="flex items-center gap-2 font-subtitle text-eyebrow font-bold text-primary-ink uppercase">
              <StatusDot status={status} tone="light" />
              {live ? `Peshawar · ${formatClock(status.now)}` : "Office hours"}
            </p>
            <p className="mt-2 font-heading text-[2.25rem] leading-none font-bold tracking-[0.06em] text-strong uppercase">
              {live ? (status.state === "closed" ? "Closed" : "Open") : "Mon–Fri"}
            </p>
            <p className="mt-2 text-meta text-body">
              {live ? describeStatusLong(status) : formatOpeningHours(hours, true).replace(/^Mon–Fri, /, "")}
            </p>
          </div>
          <p className="mt-4 flex min-h-6 flex-wrap items-center justify-between gap-x-3 border-t border-border pt-3 text-meta font-semibold text-primary-ink">
            Online orders anytime
            {live && status.state === "closed" && (
              <a href="#message" className="rounded-sm text-primary-ink underline underline-offset-2 hover:no-underline">
                Leave a message
              </a>
            )}
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-meta text-on-dark-muted">Hours may differ on public holidays.</p>
    </aside>
  );
}

/** Compact status line for phones, where the sign would push the actions down. */
export function OfficePill({ hours, className }: OfficeStatusProps & { className?: string }) {
  const status = useBusinessStatus(hours);
  return (
    <p
      className={cx(
        "office-pill inline-flex min-h-8 items-center gap-2 rounded-full border border-on-dark/25 bg-on-dark/10 px-3.5 py-1.5 text-meta font-semibold text-on-dark",
        className,
      )}
      data-live={status ? true : undefined}
    >
      <StatusDot status={status} tone="dark" />
      {status ? describeStatusShort(status) : formatOpeningHours(hours, true).replace(", ", " · ")}
    </p>
  );
}
