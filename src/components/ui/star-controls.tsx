"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import StarBorder from "./StarBorder";

const effect = {
  unstyled: true,
  autoRadius: true,
  color: "#c98520",
  trailColor: "#e5a52e",
  theme: "light" as const,
  duration: 6,
  glow: 0.6,
};

export function StarButton({ type = "submit", ...props }: ComponentProps<"button">) {
  return <StarBorder as="button" {...effect} type={type} {...props} />;
}

export function StarSummary(props: ComponentProps<"summary">) {
  return <StarBorder as="summary" {...effect} {...props} />;
}

function LinkTarget({ linkAs, ...props }: Omit<ComponentProps<typeof Link>, "as"> & { linkAs?: ComponentProps<typeof Link>["as"] }) {
  return <Link as={linkAs} {...props} />;
}

export function StarLink({ as: linkAs, ...props }: ComponentProps<typeof Link>) {
  return <StarBorder as={LinkTarget} {...effect} linkAs={linkAs} {...props} />;
}
