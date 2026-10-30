import { StarLink } from "@/components/ui/star-controls";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FiltersDisclosure } from "@/components/ui/filters-disclosure";
import { Pagination } from "@/components/ui/pagination";
import { BlogListCard } from "@/features/blog/components/blog-list-card";
import { BlogSidebar } from "@/features/blog/components/blog-sidebar";
import { blogHref, getBlogCategoryName, parseBlogQuery, queryPosts, type BlogQuery } from "@/features/blog/queries";
import { blogCoverImage, getSiteContent } from "@/features/content/content-data";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { blogAuthorImage } from "@/features/blog/author-image";

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
      <PageHero title="The Honey Journal" eyebrow="Stories from the hive" crumbs={[{ label: "Blog" }]} />
      <Container className="py-16 lg:py-24">
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

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
      <section aria-label="Blog posts" className="lg:col-span-8">
        <FilterSummary query={query} total={result.total} />
        {result.items.length === 0 ? (
          <div className="flex flex-col items-center rounded-md border border-dashed border-border-strong/50 px-6 py-16 text-center">
            <SearchX className="size-10 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-4 text-h4 font-semibold">No posts found</h2>
            <p className="mt-2">Try another keyword or browse all posts.</p>
            <StarLink href="/blog" className={buttonClasses({ className: "mt-6" })}>
              View all posts
            </StarLink>
          </div>
        ) : (
          <ul className="space-y-8">
            {result.items.map((post) => (
              <li key={post.slug}>
                <BlogListCard
                  post={post}
                  cover={blogCoverImage(post)}
                  authorPhoto={blogAuthorImage(content)}
                />
              </li>
            ))}
          </ul>
        )}
        <Pagination
          className="mt-12"
          label="Blog pages"
          page={result.page}
          pageCount={result.pageCount}
          hrefFor={(page) => blogHref(query, { page })}
        />
      </section>

      <aside aria-label="Blog sidebar" className="lg:col-span-4">
        <FiltersDisclosure label="Blog filters">
          <BlogSidebar query={query} />
        </FiltersDisclosure>
      </aside>
    </div>
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
    <p aria-live="polite" className="mb-6 flex flex-wrap gap-x-3 text-meta text-strong">
      <span>
        {total === 1 ? "1 post" : `${total} posts`} for {labels.join(" · ")}
      </span>
      <Link href="/blog" className="font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
        Clear filters
      </Link>
    </p>
  );
}

function BlogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading posts" className="grid gap-12 lg:grid-cols-12 lg:gap-6">
      <div className="space-y-8 lg:col-span-8">
        {[0, 1].map((key) => (
          <div key={key} className="aspect-[5/4] animate-pulse rounded-sm bg-tile" />
        ))}
      </div>
      <div className="hidden space-y-8 lg:col-span-4 lg:block">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-48 animate-pulse rounded-sm bg-tile" />
        ))}
      </div>
    </div>
  );
}
