"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { cx } from "@/lib/cx";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import "./honeycomb-parallax.css";

/** Decorative home-page texture. Its parent needs `relative isolate`. */
export function HoneycombParallax({ tone = "light" }: { tone?: "light" | "dark" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  // Measure the stationary frame, never the translated pattern inside it.
  const { scrollY, scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const offset = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const y = useSpring(offset, {
    stiffness: 120,
    damping: 28,
    mass: 0.5,
    skipInitialAnimation: true,
  });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const visibility = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 300, damping: 35, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 300, damping: 35, mass: 0.4 });
  const opacity = useSpring(visibility, { stiffness: 180, damping: 26 });
  const spotlight = useMotionTemplate`radial-gradient(circle 180px at ${reduceMotion ? pointerX : smoothX}px ${reduceMotion ? pointerY : smoothY}px, #000 10%, transparent 100%)`;

  useEffect(() => {
    const surface = ref.current?.parentElement;
    if (!surface) return;

    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pointer: { x: number; y: number } | null = null;

    function updateSpotlight(snap = false) {
      if (!pointer || !hover.matches || !surface) return;
      const bounds = surface.getBoundingClientRect();
      const x = pointer.x - bounds.left;
      const y = pointer.y - bounds.top;
      pointerX.set(x);
      pointerY.set(y);
      if (snap) {
        smoothX.jump(x);
        smoothY.jump(y);
      }
      visibility.set(x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height ? 1 : 0);
    }

    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !hover.matches) return;
      const entering = pointer === null;
      pointer = { x: event.clientX, y: event.clientY };
      updateSpotlight(entering);
    }

    function hide() {
      pointer = null;
      visibility.set(0);
    }

    surface.addEventListener("pointerenter", move);
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", hide);
    surface.addEventListener("pointercancel", hide);
    hover.addEventListener("change", hide);
    // Keep the reveal under a stationary cursor while the section scrolls.
    const unsubscribe = scrollY.on("change", () => updateSpotlight());
    return () => {
      surface.removeEventListener("pointerenter", move);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", hide);
      surface.removeEventListener("pointercancel", hide);
      hover.removeEventListener("change", hide);
      unsubscribe();
    };
  }, [pointerX, pointerY, scrollY, smoothX, smoothY, visibility]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cx("home-honeycomb", tone === "dark" && "home-honeycomb--dark")}
      style={{ opacity: reduceMotion ? visibility : opacity, maskImage: spotlight, WebkitMaskImage: spotlight }}
    >
      <motion.div className="home-honeycomb__pattern" style={{ y: reduceMotion ? 0 : y }} />
    </motion.div>
  );
}
