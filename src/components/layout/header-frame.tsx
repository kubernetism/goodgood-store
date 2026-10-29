"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type HeaderFrameProps = {
  children: ReactNode;
  background: ReactNode;
  className?: string;
  /** The home hero extends under the header; other routes always use the background. */
  overHomeHero?: boolean;
};

/** Only the decorative background changes; the navigation remains stationary. */
export function HeaderFrame({ children, background, className, overHomeHero = false }: HeaderFrameProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(overHomeHero);

  useEffect(() => {
    if (!overHomeHero) return;

    let intersection: IntersectionObserver | undefined;
    let mutations: MutationObserver | undefined;
    let resize: ResizeObserver | undefined;
    let active = true;
    let observedHeight = 0;

    function observeHero(): boolean {
      const hero = document.getElementById("home-hero");
      const header = headerRef.current;
      if (!hero || !header) return false;

      function observeAtHeaderHeight() {
        const height = Math.round(header!.getBoundingClientRect().height);
        if (intersection && height === observedHeight) return;
        observedHeight = height;
        intersection?.disconnect();
        intersection = new IntersectionObserver(
          ([entry]) => {
            if (active && entry) setOverHero(entry.isIntersecting);
          },
          { rootMargin: `-${height}px 0px 0px 0px` },
        );
        intersection.observe(hero!);
      }

      observeAtHeaderHeight();
      resize = new ResizeObserver(observeAtHeaderHeight);
      resize.observe(header);
      return true;
    }

    if (!observeHero()) {
      // The home page can stream in after the shared layout has hydrated.
      // Keep navigation readable until its hero appears.
      queueMicrotask(() => { if (active) setOverHero(false); });
      mutations = new MutationObserver(() => {
        if (observeHero()) mutations?.disconnect();
      });
      mutations.observe(document.documentElement, { childList: true, subtree: true });
    }

    return () => {
      active = false;
      intersection?.disconnect();
      mutations?.disconnect();
      resize?.disconnect();
    };
  }, [overHomeHero]);

  return (
    <header ref={headerRef} data-over-hero={overHero ? "true" : "false"} className={cx("on-dark sticky top-0 z-40 isolate", className)}>
      <div
        aria-hidden="true"
        data-navbar-background
        className={cx(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-brown-950 transition-opacity duration-200 motion-reduce:transition-none",
          overHero ? "opacity-0" : "opacity-100",
        )}
      >
        {background}
      </div>
      {overHomeHero && <noscript><style>{"[data-navbar-background]{opacity:1!important}"}</style></noscript>}
      {children}
    </header>
  );
}
