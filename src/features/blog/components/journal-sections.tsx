import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { cx } from "@/lib/cx";
import type { BlogPost } from "../data";
import { blogHref, getBlogCategoryCounts, type BlogQuery } from "../queries";

const emptyQuery: BlogQuery = { category: null, tag: null, q: "", page: 1 };

const tab =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200";

/**
 * The journal's sections (categories) as tabs, plus keyword search. Same
 * URLs as before (`?category=`, `?q=`), so filtering stays server-rendered
 * and shareable.
 */
export function JournalSections({ posts, query }: { posts: ReadonlyArray<BlogPost>; query: BlogQuery }) {
  const categories = getBlogCategoryCounts(posts).filter((category) => category.count > 0);
  const isAll = !query.category && !query.tag && !query.q;

  return (
    <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <nav aria-label="Journal sections" className="-mx-4 min-w-0 sm:-mx-6 lg:mx-0">
        <ul className="journal-rail scrollbar-none relative flex gap-2 overflow-x-auto px-4 py-1 sm:px-6 lg:flex-wrap lg:px-0">
          <li>
            <Link
              href="/blog"
              aria-current={isAll ? "page" : undefined}
              className={cx(tab, isAll ? "border-strong bg-strong text-on-dark" : "border-border bg-surface text-strong hover:border-primary hover:bg-primary-tint")}
            >
              All stories
              <Count value={posts.length} active={isAll} />
            </Link>
          </li>
          {categories.map((category) => {
            const isActive = query.category === category.slug;
            return (
              <li key={category.slug}>
                <Link
                  href={blogHref(emptyQuery, { category: category.slug })}
                  aria-current={isActive ? "true" : undefined}
                  className={cx(tab, isActive ? "border-strong bg-strong text-on-dark" : "border-border bg-surface text-strong hover:border-primary hover:bg-primary-tint")}
                >
                  {category.name}
                  <Count value={category.count} active={isActive} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Form action="/blog" role="search" className="flex w-full shrink-0 lg:w-72">
        <label htmlFor="blog-search" className="sr-only">
          Search the journal
        </label>
        <input
          id="blog-search"
          name="q"
          type="search"
          maxLength={80}
          defaultValue={query.q}
          placeholder="Search stories"
          className="h-11 min-w-0 flex-1 rounded-l-full border border-r-0 border-border-strong bg-surface pr-2 pl-5 text-sm text-strong placeholder:text-muted"
        />
        <button
          type="submit"
          className="flex h-11 w-12 shrink-0 items-center justify-center rounded-r-full bg-primary text-strong transition-colors duration-200 hover:bg-primary-hover"
        >
          <Search className="size-5" aria-hidden="true" />
          <span className="sr-only">Search</span>
        </button>
      </Form>
    </div>
  );
}

function Count({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-badge",
        active ? "bg-primary text-strong" : "bg-cream text-body",
      )}
    >
      <span className="sr-only">(</span>
      {value}
      <span className="sr-only"> {value === 1 ? "story" : "stories"})</span>
    </span>
  );
}
