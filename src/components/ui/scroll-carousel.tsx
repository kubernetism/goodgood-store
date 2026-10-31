"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cx } from "@/lib/cx";

type ScrollCarouselProps = {
  label: string;
  items: ReadonlyArray<{ key: string; content: ReactNode }>;
  /** Width classes for each slide, e.g. "basis-[85%] sm:basis-1/2 lg:basis-1/3". */
  itemClassName: string;
  /** Previous/next buttons; placed outside the row on wide screens. */
  showArrows?: boolean;
  /** Bleed the track to the viewport edges (testimonials). */
  bleed?: boolean;
  className?: string;
};

/**
 * Native scroll-snap carousel: swipe/trackpad/keyboard scrolling work without
 * JS; the optional arrow buttons just call scrollBy. No autoplay, so no pause
 * control is needed.
 */
export function ScrollCarousel({
  label,
  items,
  itemClassName,
  showArrows = false,
  bleed = false,
  className,
}: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const reduceMotion = usePrefersReducedMotion();

  function updateEdges() {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      atStart: track.scrollLeft <= 4,
      atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  }

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    const firstItem = track?.querySelector("li");
    if (!track || !firstItem) return;
    track.scrollBy({
      left: direction * (firstItem.getBoundingClientRect().width + 24),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  const arrowClass =
    "flex size-11 items-center justify-center rounded-full bg-primary text-strong transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className={cx("relative", className)}>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        // Focusable so keyboard users can scroll the row with arrow keys.
        tabIndex={0}
        onScroll={updateEdges}
        className={cx("scrollbar-none snap-x snap-mandatory overflow-x-auto", bleed && "bleed-inline")}
      >
        <ul className="flex gap-6 py-2">
          {items.map((item) => (
            <li key={item.key} className={cx("shrink-0 snap-start", itemClassName)}>
              {item.content}
            </li>
          ))}
        </ul>
      </div>

      {showArrows && (
        <div className="mt-6 flex justify-center gap-3 2xl:pointer-events-none 2xl:absolute 2xl:inset-x-[-5.5rem] 2xl:top-1/2 2xl:mt-0 2xl:-translate-y-1/2 2xl:justify-between">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={edges.atStart}
            className={cx(arrowClass, "2xl:pointer-events-auto")}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            <span className="sr-only">Previous</span>
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={edges.atEnd}
            className={cx(arrowClass, "2xl:pointer-events-auto")}
          >
            <ArrowRight className="size-5" aria-hidden="true" />
            <span className="sr-only">Next</span>
          </button>
        </div>
      )}
    </div>
  );
}
