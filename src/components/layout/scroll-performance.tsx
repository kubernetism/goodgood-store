"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

/** Pause decorative canvas work briefly during native page scrolling. */
export function ScrollPerformance() {
  useEffect(() => {
    const root = document.documentElement;
    const finish = () => {
      delete root.dataset.storeScrolling;
      window.dispatchEvent(new Event("store-scroll-idle"));
    };
    const idle = gsap.delayedCall(0.16, finish).pause();
    const onScroll = () => {
      root.dataset.storeScrolling = "true";
      idle.restart(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      idle.kill();
      finish();
    };
  }, []);

  return null;
}
