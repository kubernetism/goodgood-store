"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

const RESET_MS = 2500;

export function CopyShippingButton({ text, orderNumber, size = "sm" }: { text: string; orderNumber: string; size?: "sm" | "md" }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  // "Copied" reverts so a second copy gives fresh feedback (O12).
  useEffect(() => {
    if (status !== "copied") return;
    const timer = window.setTimeout(() => setStatus("idle"), RESET_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return <span className="admin-copy-shipping">
    <button type="button" className={`admin-button secondary${size === "sm" ? " sm" : ""}`} aria-label={`Copy shipping details for ${orderNumber}`} onClick={copy}>
      {status === "copied" ? <><Check aria-hidden="true" />Copied</> : <><Copy aria-hidden="true" />Copy</>}
    </button>
    <span role="status" className={status === "error" ? "admin-field-error" : "sr-only"}>
      {status === "copied" ? "Shipping details copied." : status === "error" ? "Could not copy. Check clipboard permissions." : ""}
    </span>
  </span>;
}
