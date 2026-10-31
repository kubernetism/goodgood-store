"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type FormAction = (formData: FormData) => void | Promise<void>;

/**
 * A Server Action form that knows when it has unsaved changes (O8). While
 * dirty it sets `data-dirty` (CSS shows the "Unsaved" pill), asks before the
 * page unloads, and turns in-app link clicks into full navigations so the
 * browser's leave-page check also covers them. The action is unchanged.
 */
export function DirtyForm({ action, className, labelledBy, children }: { action: FormAction; className?: string; labelledBy?: string; children: ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = ref.current;
    if (!form) return;
    const markDirty = () => setDirty(true);
    const clear = () => setDirty(false);
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", clear);
    form.addEventListener("reset", clear);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", clear);
      form.removeEventListener("reset", clear);
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const hardNavigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.hash)) return;
      event.preventDefault();
      window.location.assign(url.href);
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", hardNavigate, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", hardNavigate, true);
    };
  }, [dirty]);

  return <form ref={ref} action={action} className={className} aria-labelledby={labelledBy} data-dirty={dirty || undefined}>{children}</form>;
}
