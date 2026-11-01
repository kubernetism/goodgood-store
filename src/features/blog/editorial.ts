import type { BlogBlock, BlogPost } from "./data";
import { getLatestPosts } from "./queries";

/** Average adult silent-reading speed for non-fiction prose. */
const WORDS_PER_MINUTE = 200;

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return block.text;
    case "quote":
      return `${block.text} ${block.cite ?? ""}`;
    case "list":
      return block.items.join(" ");
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimated minutes to read the standfirst and body (never less than one).
 * Shown before anyone has read the post; the tracked average active time
 * (see metrics.ts) complements it once visits come in.
 */
export function estimateReadingMinutes(post: Pick<BlogPost, "excerpt" | "body">): number {
  const words = countWords(post.excerpt) + post.body.reduce((total, block) => total + countWords(blockText(block)), 0);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingMinutes(minutes: number): string {
  return `${minutes} min read`;
}

/** Same-category posts first (newest first), then the newest of the rest. */
export function getRelatedPosts(posts: ReadonlyArray<BlogPost>, current: BlogPost, limit = 3): BlogPost[] {
  const others = getLatestPosts(posts).filter((post) => post.slug !== current.slug);
  const sameCategory = others.filter((post) => post.category === current.category);
  const rest = others.filter((post) => post.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export type TocEntry = { id: string; text: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Stable anchor ids for every heading block, keyed by block index. Repeated
 * headings get a numeric suffix so each id stays unique on the page.
 */
export function getHeadingAnchors(body: ReadonlyArray<BlogBlock>): Map<number, TocEntry> {
  const anchors = new Map<number, TocEntry>();
  const seen = new Map<string, number>();
  body.forEach((block, index) => {
    if (block.type !== "heading") return;
    const base = `section-${slugify(block.text) || index}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.set(index, { id: count ? `${base}-${count + 1}` : base, text: block.text });
  });
  return anchors;
}
