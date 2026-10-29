"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import StarBorder from "@/components/ui/StarBorder";

/** The hero's calls to action remain links, with the supplied StarBorder effect. */
export function HeroStarButton({ href, children, variant = "primary" }: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}) {
  const outline = variant === "outline";

  return (
    <StarBorder
      as={Link}
      href={href}
      className={`hero-star-button hero-star-button--${variant}`}
      color="#fff3d6"
      trailColor="#e5b45a"
      duration={6}
      direction="clockwise"
      stars={1}
      trailLength={0.3}
      thickness={outline ? 2 : 1}
      radius={24}
      glow={0.6}
      hover="lap"
      sparkle={false}
      clickPulse
      theme="dark"
      backgroundColor={outline ? "transparent" : "var(--color-primary)"}
      textColor={outline ? "var(--color-on-dark)" : "var(--color-strong)"}
      borderColor={outline ? "rgba(255, 248, 236, 0.9)" : "rgba(43, 29, 14, 0.45)"}
    >
      {children}
    </StarBorder>
  );
}
