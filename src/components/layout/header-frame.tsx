"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type HeaderFrameProps = {
  children: ReactNode;
  background: ReactNode;
  className?: string;
  /** ID of the hero extending under the header, if this page has one. */
  heroId?: string;
};

/** Only the decorative background changes; the navigation remains stationary. */
export function HeaderFrame({ children, background, className, heroId }: HeaderFrameProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(Boolean(heroId));

  useEffect(() => {
    if (!heroId) return;

    let intersection: IntersectionObserver | undefined;
    let active = true;
    let observedHero: HTMLElement | null = null;
    let observedHeight = 0;

    function observeHero() {
      const hero = document.getElementById(heroId!);
      const header = headerRef.current;
      if (!hero || !header) {
        intersection?.disconnect();
        intersection = undefined;
        observedHero = null;
        if (active) setOverHero(false);
        return;
      }

      const height = Math.round(header.getBoundingClientRect().height);
      if (intersection && hero === observedHero && height === observedHeight) return;
      observedHero = hero;
      observedHeight = height;
      intersection?.disconnect();
      intersection = new IntersectionObserver(
        ([entry]) => {
          if (active && entry?.target === observedHero) setOverHero(entry.isIntersecting);
        },
        { rootMargin: `-${height}px 0px 0px 0px` },
      );
      intersection.observe(hero);
    }

    // Route transitions can replace the hero while this shared header stays mounted.
    // Also handle a streamed hero that appears after the header hydrates.
    const mutations = new MutationObserver(() => {
      if (document.getElementById(heroId) !== observedHero) observeHero();
    });
    mutations.observe(document.getElementById("main") ?? document.documentElement, { childList: true, subtree: true });
    const resize = new ResizeObserver(observeHero);
    if (headerRef.current) resize.observe(headerRef.current);
    observeHero();

    return () => {
      active = false;
      intersection?.disconnect();
      mutations.disconnect();
      resize.disconnect();
    };
  }, [heroId]);

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
      {heroId && <noscript><style>{"[data-navbar-background]{opacity:1!important}"}</style></noscript>}
      {children}
    </header>
  );
}
