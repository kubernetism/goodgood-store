"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cx } from "@/lib/cx";

const noopSubscribe = () => () => {};
/** Clipboard writes need a secure context; hide the button where they can't work. */
const canCopy = () => typeof navigator !== "undefined" && Boolean(navigator.clipboard?.writeText);

type CopyButtonProps = {
  value: string;
  /** Visible label, e.g. "Copy address". */
  label: string;
  /** Announced to screen readers after copying, e.g. "Email address copied". */
  copiedMessage: string;
  variant?: "outline" | "outline-dark";
  className?: string;
};

/**
 * Copies text to the clipboard with a short "Copied" confirmation. Rendered
 * hidden on the server and until hydration confirms clipboard support, so
 * the markup matches and nothing appears that cannot work.
 */
export function CopyButton({ value, label, copiedMessage, variant = "outline", className }: CopyButtonProps) {
  const supported = useSyncExternalStore(noopSubscribe, canCopy, () => false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Permission denied or document not focused: leave the label as is.
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        hidden={!supported}
        onClick={copy}
        className={cx(buttonClasses({ variant, size: "sm" }), "relative z-10 h-11 min-w-28", className)}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {copied ? "Copied" : label}
      </button>
      <span role="status" className="sr-only">
        {copied ? copiedMessage : ""}
      </span>
    </>
  );
}
