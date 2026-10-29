"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { ImageAsset } from "@/features/products/types";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import LightRays from "@/components/ui/LightRays";
import "./hero-background.css";

/** Only the photo moves; the 80% overlay and readable copy stay stationary. */
export function HeroBackground({ image }: { image: ImageAsset }) {
  const frame = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start start", "end start"] });
  const travel = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const y = useSpring(travel, { stiffness: 120, damping: 28, mass: 0.5, skipInitialAnimation: true });

  return (
    <div ref={frame} aria-hidden="true" className="hero-background">
      <motion.div className="hero-background__photo" style={{ y: reducedMotion ? 0 : y }}>
        <Image src={image.url} alt="" fill preload sizes="100vw" className="object-cover object-center" />
      </motion.div>
      <div className="hero-background__overlay" />
      <div className="hero-background__rays">
        <LightRays
          raysOrigin="top-right"
          raysColor="#f6c57a"
          raysSpeed={0.35}
          lightSpread={0.65}
          rayLength={2.5}
          rayDensity={1.3}
          raySharpness={0.45}
          atmosphere={0}
          intensity={0.9}
          opacity={0.6}
          mouseInfluence={0.04}
          cursorShadow={false}
          clickPulse={false}
          maxDevicePixelRatio={1}
        />
      </div>
    </div>
  );
}
