"use client";

import { useState } from "react";

export function CopyShippingButton({ text, orderNumber }: { text: string; orderNumber: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

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
    <button type="button" className="admin-button secondary" aria-label={`Copy shipping details for ${orderNumber}`} onClick={copy}>
      {status === "copied" ? "Copied" : "Copy"}
    </button>
    <span role="status" className={status === "error" ? "admin-visibility-error" : "sr-only"}>
      {status === "copied" ? "Shipping details copied." : status === "error" ? "Could not copy. Check clipboard permissions." : ""}
    </span>
  </span>;
}
