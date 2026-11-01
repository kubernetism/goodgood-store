/*
 * Admin navigation model (pure, unit tested): grouped by job, not by build
 * history. Icons are named here and mapped to lucide components in the shell.
 */

export type AdminNavIcon =
  | "house"
  | "orders"
  | "mail"
  | "package"
  | "tags"
  | "megaphone"
  | "content"
  | "blog"
  | "quote"
  | "team"
  | "images"
  | "subscribers"
  | "settings";

export type AdminNavItem = { href: string; label: string; icon: AdminNavIcon; badge?: "pending" | "unread" };
export type AdminNavGroup = { label: string; items: ReadonlyArray<AdminNavItem> };

export const adminNavGroups: ReadonlyArray<AdminNavGroup> = [
  {
    label: "Today",
    items: [
      { href: "/admin", label: "Overview", icon: "house" },
      { href: "/admin/orders", label: "Orders", icon: "orders", badge: "pending" },
      { href: "/admin/messages", label: "Messages", icon: "mail", badge: "unread" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: "package" },
      { href: "/admin/categories", label: "Categories", icon: "tags" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/banners", label: "Banners", icon: "megaphone" },
      { href: "/admin/content", label: "Site content", icon: "content" },
      { href: "/admin/blog", label: "Blog", icon: "blog" },
      { href: "/admin/testimonials", label: "Testimonials", icon: "quote" },
      { href: "/admin/team", label: "Team", icon: "team" },
      { href: "/admin/subscribers", label: "Subscribers", icon: "subscribers" },
      { href: "/admin/media", label: "Media", icon: "images" },
    ],
  },
];

export const adminSettingsItem: AdminNavItem = { href: "/admin/settings", label: "Settings", icon: "settings" };

/** Items on the phone/tablet bottom bar; everything else lives in More. */
export const bottomBarHrefs = ["/admin", "/admin/orders", "/admin/messages", "/admin/products"] as const;

/** Overview matches only itself; every other item also matches its sub-pages. */
export function isNavItemActive(pathname: string, href: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === href) return true;
  if (href === "/admin") return false;
  return path.startsWith(`${href}/`);
}

/** True when the current page lives behind the More sheet (so More shows as active). */
export function isMoreActive(pathname: string): boolean {
  const all = [...adminNavGroups.flatMap((group) => group.items), adminSettingsItem];
  return all.some((item) => !(bottomBarHrefs as ReadonlyArray<string>).includes(item.href) && isNavItemActive(pathname, item.href));
}
