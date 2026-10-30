import { StarButton } from "@/components/ui/star-controls";
import Form from "next/form";
import Link from "next/link";
import { Calendar, Search, User } from "lucide-react";
import { SocialLinks } from "@/components/layout/social-links";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { MediaImage } from "@/components/ui/media-image";
import { blogCoverImage, getSiteContent } from "@/features/content/content-data";
import { getPublishedBlogPosts } from "../blog-data";
import { blogAuthorImage } from "../author-image";
import { SidebarPanel } from "@/components/ui/sidebar-panel";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/cx";
import { blogAuthor, type BlogCategorySlug } from "../data";
import { blogHref, getBlogCategoryCounts, getBlogTags, getLatestPosts, type BlogQuery } from "../queries";

const emptyQuery: BlogQuery = { category: null, tag: null, q: "", page: 1 };

type BlogSidebarProps = {
  /** Highlights the current category/tag and pre-fills the search box. */
  query?: BlogQuery;
  activeCategory?: BlogCategorySlug;
};

export async function BlogSidebar({ query = emptyQuery, activeCategory }: BlogSidebarProps) {
  const currentCategory = activeCategory ?? query.category;
  const [content, posts] = await Promise.all([getSiteContent(), getPublishedBlogPosts()]);

  return (
    <div className="space-y-8">
      <SidebarPanel title="About Me" variant="accent">
        <div className="text-center">
          <MediaImage
            image={blogAuthorImage(content)}
            alt=""
            sizes="96px"
            icon={User}
            rounded="full"
            className="mx-auto size-24"
          />
          <p className="mt-4 font-display text-base font-semibold text-strong">{blogAuthor.name}</p>
          <p className="text-meta text-primary-ink">{blogAuthor.role}</p>
          <p className="mt-3 text-sm">{blogAuthor.bio}</p>
          <SocialLinks className="mt-3 justify-center text-muted" iconClassName="size-4" />
        </div>
      </SidebarPanel>

      <SidebarPanel title="Search Objects" variant="accent">
        <Form action="/blog" role="search" className="flex">
          <label htmlFor="blog-search" className="sr-only">
            Search the blog
          </label>
          <input
            id="blog-search"
            name="q"
            type="search"
            maxLength={80}
            defaultValue={query.q}
            placeholder="Search your keyword"
            className="h-11 min-w-0 flex-1 rounded-l-sm border border-r-0 border-border-strong bg-tile px-3 text-sm text-strong placeholder:text-muted"
          />
          <StarButton
            type="submit"
            className="flex size-11 shrink-0 items-center justify-center rounded-r-sm bg-primary text-strong transition-colors duration-200 hover:bg-primary-hover"
          >
            <Search className="size-5" aria-hidden="true" />
            <span className="sr-only">Search</span>
          </StarButton>
        </Form>
      </SidebarPanel>

      <SidebarPanel title="Recent Posts" variant="accent">
        <ul className="divide-y divide-border">
          {getLatestPosts(posts, 4).map((post) => (
            <li key={post.slug} className="group relative flex gap-4 py-4 first:pt-0 last:pb-0">
              <MediaImage
                image={blogCoverImage(post)}
                alt=""
                sizes="56px"
                icon={HoneyDipperIcon}
                iconSize="sm"
                rounded="full"
                className="size-14 shrink-0"
              />
              <div>
                <h3 className="font-subtitle text-sm leading-snug font-bold text-strong">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors duration-200 group-hover:text-primary-ink after:absolute after:inset-0"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-meta font-medium text-strong">
                  <Calendar className="size-3.5 text-primary-ink" aria-hidden="true" />
                  <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SidebarPanel>

      <SidebarPanel title="Categories" variant="accent">
        <ul className="space-y-3">
          {getBlogCategoryCounts(posts).filter((category) => category.count > 0).map((category) => {
            const isActive = currentCategory === category.slug;
            return (
              <li key={category.slug}>
                <Link
                  href={blogHref(emptyQuery, { category: category.slug })}
                  aria-current={isActive ? "true" : undefined}
                  className={cx(
                    "flex min-h-11 items-center justify-between px-3 font-display text-sm font-semibold transition-colors duration-200",
                    isActive ? "bg-strong text-on-dark" : "bg-primary text-strong hover:bg-strong hover:text-on-dark",
                  )}
                >
                  {category.name}
                  <span>{String(category.count).padStart(2, "0")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </SidebarPanel>

      <SidebarPanel title="Never Miss News" variant="accent">
        <SocialLinks
          variant="boxed"
          iconClassName="size-5"
          networks={[
            { network: "facebook", label: "Facebook", href: "https://facebook.com" },
            { network: "x", label: "X (Twitter)", href: "https://x.com" },
            { network: "instagram", label: "Instagram", href: "https://instagram.com" },
            { network: "youtube", label: "YouTube", href: "https://youtube.com" },
          ]}
        />
      </SidebarPanel>

      <SidebarPanel title="Popular Tags" variant="accent">
        <ul className="flex flex-wrap gap-2.5">
          {getBlogTags(posts).map((tag) => {
            const isActive = query.tag === tag;
            return (
              <li key={tag}>
                <Link
                  href={blogHref(emptyQuery, { tag })}
                  aria-current={isActive ? "true" : undefined}
                  className={cx(
                    "inline-flex min-h-9 items-center px-3 font-display text-meta font-semibold transition-colors duration-200",
                    isActive ? "bg-strong text-on-dark" : "bg-primary text-strong hover:bg-strong hover:text-on-dark",
                  )}
                >
                  {tag}
                </Link>
              </li>
            );
          })}
        </ul>
      </SidebarPanel>
    </div>
  );
}
