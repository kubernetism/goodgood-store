import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HoneycombLoader } from "@/components/ui/honeycomb-mark";
import { Pagination } from "@/components/ui/pagination";
import { Eyebrow } from "@/components/ui/section-heading";
import { FeaturedStory } from "@/features/blog/components/featured-story";
import { JournalColophon } from "@/features/blog/components/journal-colophon";
import { JournalHero } from "@/features/blog/components/journal-hero";
import { JournalSections } from "@/features/blog/components/journal-sections";
import { StoryCard } from "@/features/blog/components/story-card";
import { blogHref, getBlogCategoryName, parseBlogQuery, queryPosts, type BlogQuery } from "@/features/blog/queries";
import { blogCoverImage, getSiteContent } from "@/features/content/content-data";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { blogAuthorImage } from "@/features/blog/author-image";
import "@/features/blog/components/blog.css";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const [params, posts] = await Promise.all([searchParams, getPublishedBlogPosts()]);
  const query = parseBlogQuery(params, posts);
  const result = queryPosts(posts, query);
  const filtered = Boolean(params.category || params.tag || query.q);
  return {
    title: "Honey Journal",
    description: "Explore honey recipes, buying guides and stories from Abdul Sami Honey Enterprises.",
    robots: { index: !filtered, follow: true },
    ...(!filtered ? { alternates: { canonical: blogHref({ category: null, tag: null, q: "", page: result.page }, { page: result.page }) } } : {}),
  };
}

export default function BlogPage({ searchParams }: PageProps<"/blog">) {
  return (
    <>
      <JournalHero />
      <Container className="pt-10 pb-16 lg:pt-14 lg:pb-24">
        <Suspense fallback={<BlogSkeleton />}>
          <BlogContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function BlogContent({ searchParams }: Pick<PageProps<"/blog">, "searchParams">) {
  const [params, content, posts] = await Promise.all([searchParams, getSiteContent(), getPublishedBlogPosts()]);
  const query = parseBlogQuery(params, posts);
  const result = queryPosts(posts, query);
  const authorPhoto = blogAuthorImage(content);
  // The newest matching story leads the first page; later pages are a plain grid.
  const [lead, ...rest] = result.page === 1 ? result.items : [];
  const stories = lead ? rest : result.items;

  return (
    <>
      <JournalSections posts={posts} query={query} />

      <section aria-labelledby="stories-heading" className="mt-8 lg:mt-10">
        <h2 id="stories-heading" className="sr-only">
          Stories
        </h2>
        <FilterSummary query={query} total={result.total} />

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong/50 bg-tile px-6 py-16 text-center">
            <SearchX className="size-10 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 text-h4 font-semibold text-strong">No stories found</p>
            <p className="mt-2">Try another keyword or browse every story.</p>
            <Link href="/blog" className={buttonClasses({ className: "mt-6" })}>
              View all stories
            </Link>
          </div>
        ) : (
          <>
            {lead && <FeaturedStory post={lead} cover={blogCoverImage(lead)} authorPhoto={authorPhoto} />}
            {stories.length > 0 && (
              <>
                {lead && (
                  <div className="mt-14 mb-8 flex items-center gap-4 lg:mt-16">
                    <Eyebrow>More from the hive</Eyebrow>
                    <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  </div>
                )}
                <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {stories.map((post) => (
                    <li key={post.slug} className="reveal">
                      <StoryCard post={post} cover={blogCoverImage(post)} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        <Pagination
          className="mt-14"
          label="Journal pages"
          page={result.page}
          pageCount={result.pageCount}
          hrefFor={(page) => blogHref(query, { page })}
        />
      </section>

      <div className="mt-16 lg:mt-24">
        <JournalColophon posts={posts} query={query} authorPhoto={authorPhoto} />
      </div>
    </>
  );
}

function FilterSummary({ query, total }: { query: BlogQuery; total: number }) {
  const labels = [
    query.q && `“${query.q}”`,
    query.category && getBlogCategoryName(query.category),
    query.tag && `#${query.tag}`,
  ].filter(Boolean);
  if (labels.length === 0) return null;

  return (
    <p aria-live="polite" className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-promo font-bold text-strong">
        {total === 1 ? "1 story" : `${total} stories`} for {labels.join(" · ")}
      </span>
      <Link href="/blog" className="text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
        Clear filters
      </Link>
    </p>
  );
}

function BlogSkeleton() {
  return (
    <div aria-busy="true" className="relative">
      <HoneycombLoader label="Loading stories…" className="absolute inset-x-0 top-48 z-10 justify-center" />
      <div className="flex gap-2 border-b border-border pb-6">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-11 w-32 animate-pulse rounded-full bg-tile" />
        ))}
      </div>
      <div className="mt-10 grid overflow-hidden rounded-lg bg-cream lg:grid-cols-12">
        <div className="aspect-[4/3] animate-pulse bg-tile lg:col-span-7 lg:aspect-[5/4]" />
        <div className="space-y-4 p-8 lg:col-span-5">
          <div className="h-4 w-24 animate-pulse rounded-sm bg-tile" />
          <div className="h-10 w-full animate-pulse rounded-sm bg-tile" />
          <div className="h-24 w-full animate-pulse rounded-sm bg-tile" />
        </div>
      </div>
    </div>
  );
}
