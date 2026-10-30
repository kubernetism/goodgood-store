import { mainNav, type NavItem } from "@/lib/site";
import { getCategoryCounts } from "./catalog";
import type { Catalog } from "./types";

/** Shop navigation only includes categories with products visible to shoppers. */
export function catalogNavigation(catalog: Catalog): ReadonlyArray<NavItem> {
  const categories = getCategoryCounts(catalog).filter((category) => category.count > 0);
  return mainNav.map((item) => item.label === "Shop" ? {
    ...item,
    children: [
      { label: "All Honey", href: "/shop" },
      ...categories.map((category) => ({ label: category.name, href: `/shop?category=${encodeURIComponent(category.slug)}` })),
    ],
  } : item);
}
