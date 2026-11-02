import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "dark" | "outline" | "outline-dark";
type Size = "md" | "sm" | "pill";

/*
 * Pill buttons, uppercase 13px semibold with open tracking.
 * Honey fills always carry brown text (9.42:1); white on honey is 1.73:1.
 * `dark` (brown fill, cream text, 15.48:1) is the primary CTA on honey surfaces.
 */
const base =
  "inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-strong hover:bg-primary-hover",
  dark: "bg-strong text-on-dark hover:bg-brown-800",
  /* Brown outline for ivory and honey surfaces. */
  outline: "border-2 border-strong text-strong hover:bg-strong hover:text-on-dark",
  /* Cream outline for brown bands. */
  "outline-dark": "border-2 border-on-dark text-on-dark hover:bg-on-dark hover:text-strong",
};

const sizes: Record<Size, string> = {
  md: "h-12 rounded-full px-7 text-button uppercase",
  sm: "h-10 rounded-full px-5 text-button uppercase",
  pill: "min-h-8 rounded-full px-4 py-1.5 text-meta",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cx(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
