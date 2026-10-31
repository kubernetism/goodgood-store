"use client";

import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A notice produced by a redirect (?saved=1, ?error=…). On arrival it takes
 * focus so screen readers announce it after a soft navigation, and the flag
 * is removed from the URL so a refresh or Back does not repeat it (O6).
 * It can be dismissed; a later redirect with the flag shows it again.
 * `clear` lists the query parameters to remove, comma-separated ("saved,error").
 */
export function FlashNotice({ tone, clear, children }: { tone: "success" | "error"; clear: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const flash = clear.split(",").map((name) => searchParams.get(name) ?? "").join("|");
  const hasFlash = flash.replaceAll("|", "") !== "";
  const [hidden, setHidden] = useState(false);
  const [seenFlash, setSeenFlash] = useState(flash);
  // A new redirect flag re-shows a dismissed notice (state adjusted during render).
  if (flash !== seenFlash) {
    setSeenFlash(flash);
    if (hasFlash) setHidden(false);
  }

  useEffect(() => {
    if (!hasFlash) return;
    ref.current?.focus();
    const url = new URL(window.location.href);
    for (const name of clear.split(",")) url.searchParams.delete(name);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [flash, hasFlash, clear]);

  if (hidden) return null;
  return <div ref={ref} tabIndex={-1} className="admin-notice" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
    {children}
    <button type="button" className="admin-notice-dismiss" aria-label="Dismiss message" title="Dismiss" onClick={() => setHidden(true)}><X aria-hidden="true" /></button>
  </div>;
}
