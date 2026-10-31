"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type MouseEvent, type ReactNode } from "react";
import { isMoreActive, isNavItemActive } from "./nav";

/** Closes the More sheet when one of its links is followed (soft navigation keeps the layout mounted). */
function closeContainingPopover(event: MouseEvent<HTMLElement>) {
  const popover = event.currentTarget.closest<HTMLElement>("[popover]");
  if (popover?.matches(":popover-open")) popover.hidePopover();
}

/** Nav link that marks itself as the current page (aria-current) from the pathname. */
export function AdminNavLink({ href, className, ariaLabel, children }: { href: string; className: string; ariaLabel?: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = isNavItemActive(pathname, href);
  return <Link href={href} className={className} aria-label={ariaLabel} aria-current={active ? "page" : undefined} onClick={closeContainingPopover}>{children}</Link>;
}

/** The bottom bar's More trigger: looks active when the current page lives in the sheet. */
export function AdminMoreButton({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <button type="button" className="admin-tab" popoverTarget="admin-more" data-active={isMoreActive(pathname) || undefined}>{children}</button>;
}

/** Plays the shell's page-load reveal once, then switches to the quiet soft-navigation fade. */
export function ShellBoot() {
  useEffect(() => {
    const timer = window.setTimeout(() => document.querySelector(".admin-shell")?.setAttribute("data-booted", ""), 700);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
