/*
 * Where a media item is used, and what deleting it does. Mirrors the foreign
 * keys in src/db/schema.ts: product_images cascades (the photo leaves the
 * product's gallery); categories, banners, blog covers and content slots are
 * set null (they fall back to their placeholder), as are team member photos.
 * Testimonials have no image.
 */

export type MediaUsage = {
  products: string[];
  categories: string[];
  banners: string[];
  blogPosts: string[];
  contentSlots: string[];
  teamMembers: string[];
};

export const emptyMediaUsage = (): MediaUsage => ({ products: [], categories: [], banners: [], blogPosts: [], contentSlots: [], teamMembers: [] });

const groups = [
  ["products", "Product gallery", "Product galleries"],
  ["categories", "Category", "Categories"],
  ["banners", "Banner", "Banners"],
  ["blogPosts", "Blog cover", "Blog covers"],
  ["contentSlots", "Site content slot", "Site content slots"],
  ["teamMembers", "Team member", "Team members"],
] as const satisfies ReadonlyArray<readonly [keyof MediaUsage, string, string]>;

/** Non-empty usage groups, labelled for display ("Product galleries: Sidr, Acacia"). */
export function mediaUsageGroups(usage: MediaUsage): { label: string; names: string[] }[] {
  return groups.flatMap(([key, one, many]) => usage[key].length ? [{ label: usage[key].length === 1 ? one : many, names: usage[key] }] : []);
}

export function isMediaUnused(usage: MediaUsage): boolean {
  return mediaUsageGroups(usage).length === 0;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Plain-language consequence of deleting the image, for the in-page confirmation. */
export function mediaDeleteWarning(usage: MediaUsage): string {
  if (isMediaUnused(usage)) return "This image isn't used anywhere. Deleting it removes it from the library permanently.";
  const placeholders = [
    usage.categories.length ? count(usage.categories.length, "category", "categories") : "",
    usage.banners.length ? count(usage.banners.length, "banner", "banners") : "",
    usage.blogPosts.length ? count(usage.blogPosts.length, "blog post", "blog posts") : "",
    usage.contentSlots.length ? count(usage.contentSlots.length, "content slot", "content slots") : "",
    usage.teamMembers.length ? count(usage.teamMembers.length, "team member", "team members") : "",
  ].filter(Boolean);
  return [
    "Deleting this image is permanent.",
    usage.products.length ? `It will be removed from the photo gallery of ${count(usage.products.length, "product", "products")}.` : "",
    placeholders.length ? `${placeholders.join(", ")} will lose it and show a placeholder instead.` : "",
  ].filter(Boolean).join(" ");
}

/** "A, B, C and 2 more" — keeps long usage lists to one readable line. */
export function summariseNames(names: ReadonlyArray<string>, max = 3): string {
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} and ${names.length - max} more`;
}
