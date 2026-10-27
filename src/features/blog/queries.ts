import { blogCategories, blogPosts, type BlogCategorySlug, type BlogPost } from "./data";

export const BLOG_PAGE_SIZE = 4;

export function getLatestPosts(limit = Infinity): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)).slice(0, limit);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPopularPosts(limit: number): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getBlogCategoryName(slug: BlogCategorySlug): string {
  return blogCategories.find((category) => category.slug === slug)?.name ?? slug;
}

export function getBlogCategoryCounts() {
  return blogCategories.map((category) => ({
    ...category,
    count: blogPosts.filter((post) => post.category === category.slug).length,
  }));
}

export function getBlogTags(): string[] {
  return [...new Set(blogPosts.flatMap((post) => post.tags))];
}

/** Previous (older) and next (newer) posts around `slug`, by publish date. */
export function getAdjacentPosts(slug: string): { previous?: BlogPost; next?: BlogPost } {
  const ordered = getLatestPosts();
  const index = ordered.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return { previous: ordered[index + 1], next: ordered[index - 1] };
}

export type BlogQuery = { category: BlogCategorySlug | null; tag: string | null; q: string; page: number };

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseBlogQuery(raw: RawSearchParams): BlogQuery {
  const categoryParam = first(raw.category);
  const category = blogCategories.find((c) => c.slug === categoryParam)?.slug ?? null;
  const tagParam = first(raw.tag);
  const tag = tagParam && getBlogTags().includes(tagParam) ? tagParam : null;
  const q = (first(raw.q) ?? "").trim().slice(0, 80);
  const pageParam = first(raw.page);
  const page = pageParam && /^\d{1,4}$/.test(pageParam) ? Math.max(1, Number(pageParam)) : 1;
  return { category, tag, q, page };
}

export function blogHref(query: BlogQuery, overrides: Partial<BlogQuery> = {}): string {
  const next: BlogQuery = { ...query, page: 1, ...overrides };
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.tag) params.set("tag", next.tag);
  if (next.q) params.set("q", next.q);
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
}

export function queryPosts(query: BlogQuery, pageSize = BLOG_PAGE_SIZE) {
  const needle = query.q.toLowerCase();
  const matches = getLatestPosts().filter(
    (post) =>
      (!query.category || post.category === query.category) &&
      (!query.tag || post.tags.includes(query.tag)) &&
      (!needle || `${post.title} ${post.excerpt}`.toLowerCase().includes(needle)),
  );
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(query.page, pageCount);
  return {
    items: matches.slice((page - 1) * pageSize, page * pageSize),
    total: matches.length,
    page,
    pageCount,
  };
}
