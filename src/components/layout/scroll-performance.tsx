"use client";

import { useEffect } from "react";

/** Quiet period after the last scroll event before decorative work resumes. */
const SCROLL_IDLE_MS = 160;

/**
 * Pause decorative animation work (hero light rays, sliding rows) briefly
 * during native page scrolling. A plain timer is enough here: this used to
 * pull in GSAP (~20 KB gzipped) for a single debounced call.
 */
export function ScrollPerformance() {
  useEffect(() => {
    const root = document.documentElement;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      idle = undefined;
      delete root.dataset.storeScrolling;
      window.dispatchEvent(new Event("store-scroll-idle"));
    };
    const onScroll = () => {
      root.dataset.storeScrolling = "true";
      clearTimeout(idle);
      idle = setTimeout(finish, SCROLL_IDLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
      finish();
    };
  }, []);

  return null;
}
