"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FocusEvent, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/lib/site";
import { cx } from "@/lib/cx";

type Tone = "honey" | "dark";

function pathOf(href: string): string {
  return href.split(/[?#]/)[0] || "/";
}

/**
 * Links that carry a query or hash (e.g. "Gift Sets" = /shop?category=gift-sets)
 * are never marked active: the pathname alone can't tell them apart from /shop.
 */
export function isActivePath(href: string, activePath: string | null): boolean {
  if (!activePath || /[?#]/.test(href)) return false;
  const path = pathOf(href);
  return path === "/" ? activePath === "/" : activePath === path || activePath.startsWith(`${path}/`);
}

function isItemActive(item: NavItem, activePath: string | null): boolean {
  if (item.href && isActivePath(item.href, activePath)) return true;
  return item.children?.some((child) => isActivePath(child.href, activePath)) ?? false;
}

/** Desktop navigation that highlights the current section. */
export function ActiveMainNav({ tone, items }: { tone: Tone; items: ReadonlyArray<NavItem> }) {
  return <MainNav tone={tone} activePath={usePathname()} items={items} />;
}

/**
 * Desktop navigation with hover/click dropdowns. `activePath` is null in the
 * prerendered fallback (pathname unknown), so nothing is highlighted there.
 */
export function MainNav({ tone, activePath, items }: { tone: Tone; activePath: string | null; items: ReadonlyArray<NavItem> }) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  function closeOnEscape(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || openLabel === null) return;
    const toggle = event.currentTarget.querySelector<HTMLButtonElement>(`[data-menu-toggle="${openLabel}"]`);
    setOpenLabel(null);
    toggle?.focus();
  }

  function closeWhenFocusLeaves(event: FocusEvent<HTMLLIElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpenLabel(null);
  }

  // On honey, amber text would fail contrast, so state is shown with a brown
  // underline instead of colour. On brown, honey text is 9.42:1.
  const linkTone =
    tone === "dark"
      ? "text-on-dark hover:text-primary"
      : "text-strong decoration-2 underline-offset-8 hover:underline";
  const activeTone =
    tone === "dark"
      ? "text-primary underline decoration-2 underline-offset-8"
      : "text-strong underline decoration-2 underline-offset-8";

  return (
    <nav aria-label="Main" onKeyDown={closeOnEscape}>
      <ul className="flex items-center gap-1 xl:gap-3">
        {items.map((item) => {
          const isActive = isItemActive(item, activePath);
          const isOpen = openLabel === item.label;
          const menuId = `menu-${item.label.toLowerCase()}`;

          if (!item.children) {
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={!/[?#]/.test(item.href) && pathOf(item.href) === activePath ? "page" : undefined}
                  className={cx(
                    "flex h-11 items-center rounded-sm px-2 text-sm font-semibold transition-colors duration-200",
                    isActive ? activeTone : linkTone,
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label} className="group/menu relative flex items-center" onBlur={closeWhenFocusLeaves}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cx(
                    "flex h-11 items-center rounded-sm pl-2 text-sm font-semibold transition-colors duration-200",
                    isActive ? activeTone : linkTone,
                  )}
                >
                  {item.label}
                </Link>
              ) : null}
              <button
                type="button"
                data-menu-toggle={item.label}
                aria-expanded={isOpen}
                aria-controls={menuId}
                aria-label={item.href ? `${item.label} submenu` : undefined}
                onClick={() => setOpenLabel(isOpen ? null : item.label)}
                className={cx(
                  "flex h-11 items-center gap-1 rounded-sm pr-2 text-sm font-semibold transition-colors duration-200",
                  item.href ? "pl-1" : "pl-2",
                  isActive ? activeTone : linkTone,
                )}
              >
                {!item.href && item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={cx("size-4 transition-transform duration-200", isOpen && "rotate-180")}
                  strokeWidth={2.25}
                />
              </button>
              <ul
                id={menuId}
                className={cx(
                  "on-light absolute top-full left-0 z-50 max-h-[min(70vh,32rem)] min-w-52 overflow-y-auto rounded-md border border-border bg-surface py-2 shadow-card-hover transition duration-200 ease-out",
                  "invisible translate-y-1 opacity-0 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100",
                  isOpen && "visible translate-y-0 opacity-100",
                )}
              >
                {item.children.map((child) => {
                  const isCurrent = pathOf(child.href) === activePath && !child.href.includes("?") && !child.href.includes("#");
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => setOpenLabel(null)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cx(
                          "block px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-primary-tint hover:text-primary-ink",
                          isCurrent ? "text-primary-ink" : "text-strong",
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
