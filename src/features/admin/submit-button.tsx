"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { HoneycombMark } from "@/components/ui/honeycomb-mark";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "danger-quiet";

/**
 * Submit button for Server Action forms (O7). While the action runs it shows
 * pending text and ignores repeat taps. It uses aria-disabled rather than
 * `disabled` so screen readers still read the label.
 */
export function SubmitButton({ children, pendingLabel = "Saving…", variant = "primary", size, block = false, className, name, value, ariaLabel }: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  size?: "sm";
  block?: boolean;
  className?: string;
  name?: string;
  value?: string;
  ariaLabel?: string;
}) {
  const { pending } = useFormStatus();
  const classes = ["admin-button", variant === "primary" ? "" : variant, size ?? "", block ? "block" : "", className ?? ""].filter(Boolean).join(" ");
  return <button
    type="submit"
    className={classes}
    name={name}
    value={value}
    aria-label={pending ? undefined : ariaLabel}
    aria-disabled={pending || undefined}
    onClick={(event) => { if (pending) event.preventDefault(); }}
  >
    {pending ? <><HoneycombMark tone="ink" size={20} />{pendingLabel}</> : children}
  </button>;
}
