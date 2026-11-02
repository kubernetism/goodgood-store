"use client";

import { useSyncExternalStore } from "react";

// One shared 1s ticker for every subscriber.
function subscribe(onTick: () => void) {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
}

// Whole seconds keep the snapshot stable between ticks.
const getNowSeconds = () => Math.floor(Date.now() / 1000);
// The server can't know the visitor's "now", so it renders placeholders.
const getServerNow = () => null;

function split(totalSeconds: number) {
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Countdown: four circles with labels. The ticking digits are hidden
 * from screen readers (a per-second announcement is noise); the end date is
 * exposed as text instead.
 */
type DealCountdownProps = {
  endsAt: string;
  endsAtLabel: string;
  /** `dark` for brown bands. */
  tone?: "light" | "dark";
};

export function DealCountdown({ endsAt, endsAtLabel, tone = "light" }: DealCountdownProps) {
  const isDark = tone === "dark";
  const nowSeconds = useSyncExternalStore(subscribe, getNowSeconds, getServerNow);
  const endSeconds = Math.floor(Date.parse(endsAt) / 1000);
  const remaining = nowSeconds === null ? null : Math.max(0, endSeconds - nowSeconds);
  const hasEnded = remaining === 0;
  const parts = remaining === null ? null : split(remaining);

  const units = [
    { label: "Days", value: parts?.days },
    { label: "Hrs", value: parts?.hours },
    { label: "Mins", value: parts?.minutes },
    { label: "Secs", value: parts?.seconds },
  ];

  return (
    <div>
      <p className="sr-only">{hasEnded ? "This deal has ended." : `Deal ends ${endsAtLabel}.`}</p>
      {hasEnded ? (
        <p aria-hidden="true" className={`text-h4 font-semibold ${isDark ? "text-on-dark" : "text-strong"}`}>
          Deal ended
        </p>
      ) : (
        <ol aria-hidden="true" className="flex gap-4 sm:gap-6">
          {units.map((unit) => (
            <li key={unit.label} className="flex flex-col items-center gap-3">
              <span
                className={
                  isDark
                    ? "flex size-16 items-center justify-center rounded-full border border-primary/40 bg-brown-900 text-xl font-bold text-on-dark"
                    : "flex size-16 items-center justify-center rounded-full border border-border bg-surface text-xl font-bold text-strong"
                }
              >
                {unit.value === undefined ? "00" : pad(unit.value)}
              </span>
              <span className={`text-meta font-medium uppercase ${isDark ? "text-on-dark-muted" : "text-strong"}`}>
                {unit.label}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
