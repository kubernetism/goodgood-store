"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cx } from "@/lib/cx";
import { slidingItemTranslation, wrapRowOffset } from "./sliding-row-math";
import "./sliding-row.css";

type SlidingRowProps = {
  label: string;
  items: ReadonlyArray<{ key: string; content: ReactNode }>;
  /** Slow, constant speed in pixels per second. */
  speed?: number;
  /** Use the whole section width, without the centered carousel cap. */
  fullWidth?: boolean;
  className?: string;
};

/** One real copy of each card: seamless motion without duplicate links or reviews. */
export function SlidingRow({ label, items, speed = 18, fullWidth = false, className }: SlidingRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const offset = useMotionValue(0);
  const step = useMotionValue(0);
  const inView = useInView(viewportRef);
  const reduceMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ x: number; offset: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const canLoop = items.length > 1;

  useEffect(() => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    const first = list?.firstElementChild;
    if (!viewport || !list || !first) return;
    const observer = new ResizeObserver(() => {
      const width = first.getBoundingClientRect().width;
      const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
      step.set(width + gap);
      setReady(width > 0);
    });
    observer.observe(viewport);
    observer.observe(first);
    return () => observer.disconnect();
  }, [items.length, step]);

  // Mount the ticker only while the row can move, so offscreen, paused or
  // held (hover, focus, drag) rows don't keep Motion's frame loop awake.
  const canAnimate = ready && canLoop && !reduceMotion && !paused && !hovered && !focused && !dragging && inView;

  function move(direction: -1 | 1) {
    setPaused(true);
    if (reduceMotion || !ready) {
      viewportRef.current?.scrollBy({ left: direction * step.get(), behavior: "auto" });
    } else {
      offset.set(wrapRowOffset(offset.get() + direction * step.get(), step.get() * items.length));
    }
  }

  if (!items.length) return null;

  return (
    <div
      className={cx("sliding-row", fullWidth && "sliding-row--full-width", className)}
      style={{ "--row-max-columns": Math.max(1, Math.min(fullWidth ? 6 : 3, items.length - 1)) } as CSSProperties}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        ref={viewportRef}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        tabIndex={0}
        data-enhanced={ready && canLoop && !reduceMotion ? "true" : undefined}
        className="sliding-row__viewport scrollbar-none"
        onFocusCapture={(event) => {
          setFocused(true);
          const item = (event.target as HTMLElement).closest<HTMLElement>("[data-sliding-index]");
          if (!item || reduceMotion) return;
          const viewport = event.currentTarget.getBoundingClientRect();
          const bounds = item.getBoundingClientRect();
          if (bounds.left < viewport.left || bounds.right > viewport.right) {
            offset.set(Number(item.dataset.slidingIndex) * step.get());
          }
          event.currentTarget.scrollLeft = 0;
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        onPointerDown={(event) => {
          suppressClick.current = false;
          if (reduceMotion || !canLoop || event.button !== 0) return;
          gesture.current = { x: event.clientX, offset: offset.get(), moved: false };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const start = gesture.current;
          if (!start) return;
          const distance = start.x - event.clientX;
          if (Math.abs(distance) > 8) {
            start.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            offset.set(wrapRowOffset(start.offset + distance, step.get() * items.length));
          }
        }}
        onPointerUp={() => {
          if (gesture.current?.moved) {
            suppressClick.current = true;
            setPaused(true);
          }
          gesture.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => { gesture.current = null; setDragging(false); }}
        onLostPointerCapture={() => { gesture.current = null; setDragging(false); }}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            gesture.current = null;
            setDragging(false);
          }
        }}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {canAnimate && (
          <RowTicker offset={offset} step={step} count={items.length} speed={speed} />
        )}
        <ul ref={listRef} className="sliding-row__list">
          {items.map((item, index) => (
            <SlidingItem key={item.key} index={index} count={items.length} offset={offset} step={step} staticMode={reduceMotion}>
              {item.content}
            </SlidingItem>
          ))}
        </ul>
      </div>
      {canLoop && (
        <div className="mt-5 flex justify-center gap-2" aria-label={`${label} controls`}>
          <button type="button" className="sliding-row__control" aria-label={`Previous ${label.toLowerCase()}`} onClick={() => move(-1)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          {!reduceMotion && (
            <button type="button" className="sliding-row__control gap-2 px-4" aria-label={`${paused ? "Play" : "Pause"} ${label.toLowerCase()}`} onClick={() => setPaused((value) => !value)}>
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              <span className="text-meta font-medium">{paused ? "Play" : "Pause"}</span>
            </button>
          )}
          <button type="button" className="sliding-row__control" aria-label={`Next ${label.toLowerCase()}`} onClick={() => move(1)}>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Advances the row each frame; renders nothing. */
function RowTicker({ offset, step, count, speed }: {
  offset: MotionValue<number>;
  step: MotionValue<number>;
  count: number;
  speed: number;
}) {
  useAnimationFrame((_, delta) => {
    if (document.hidden || document.documentElement.dataset.storeScrolling === "true") return;
    offset.set(wrapRowOffset(offset.get() + (speed * Math.min(delta, 40)) / 1000, step.get() * count));
  });
  return null;
}

function SlidingItem({ index, count, offset, step, staticMode, children }: {
  index: number;
  count: number;
  offset: MotionValue<number>;
  step: MotionValue<number>;
  staticMode: boolean;
  children: ReactNode;
}) {
  const x = useTransform(() => slidingItemTranslation(index, offset.get(), step.get(), count));
  return <motion.li data-sliding-index={index} className="sliding-row__item" style={{ x: staticMode ? 0 : x }}>{children}</motion.li>;
}
