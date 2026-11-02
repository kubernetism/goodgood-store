import Link from "next/link";
import { User } from "lucide-react";
import { SiteSocialLinks } from "@/components/layout/social-links";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section-heading";
import type { ImageAsset } from "@/features/products/types";
import { cx } from "@/lib/cx";
import { blogAuthor, type BlogPost } from "../data";
import { blogHref, getBlogTags, type BlogQuery } from "../queries";

const emptyQuery: BlogQuery = { category: null, tag: null, q: "", page: 1 };

/** Index footer band: the editor's note and every tag as a browsable index. */
export function JournalColophon({
  posts,
  query,
  authorPhoto,
}: {
  posts: ReadonlyArray<BlogPost>;
  query: BlogQuery;
  authorPhoto: ImageAsset | null;
}) {
  const tags = getBlogTags(posts);
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section aria-labelledby="editor-heading" className="rounded-lg bg-cream p-6 sm:p-8 lg:col-span-7">
        <Eyebrow decorated="leading">From the editor</Eyebrow>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="journal-hex block w-fit shrink-0 bg-primary p-1">
            <MediaImage image={authorPhoto} alt="" sizes="96px" icon={User} className="journal-hex size-24" />
          </span>
          <div>
            <h2 id="editor-heading" className="font-subtitle text-promo font-bold">
              {blogAuthor.name}
            </h2>
            <p className="font-display text-meta font-semibold text-primary-ink">{blogAuthor.role}</p>
            <p className="journal-standfirst mt-3 text-lg text-body">{blogAuthor.bio}</p>
            <SiteSocialLinks className="mt-3 -ml-3 text-muted" iconClassName="size-4" />
          </div>
        </div>
      </section>

      {tags.length > 0 && (
        <section aria-labelledby="tags-heading" className="rounded-lg border border-border p-6 sm:p-8 lg:col-span-5">
          <Eyebrow decorated="leading">Index</Eyebrow>
          <h2 id="tags-heading" className="mt-3 font-subtitle text-promo font-bold">
            Browse by tag
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = query.tag === tag;
              return (
                <li key={tag}>
                  <Link
                    href={blogHref(emptyQuery, { tag })}
                    aria-current={isActive ? "true" : undefined}
                    className={cx(
                      "inline-flex min-h-9 items-center rounded-full px-3.5 font-display text-meta font-semibold transition-colors duration-200",
                      isActive ? "bg-strong text-on-dark" : "bg-primary-tint text-strong hover:bg-primary",
                    )}
                  >
                    <span aria-hidden="true" className={cx("mr-0.5", isActive ? "text-primary" : "text-primary-ink")}>
                      #
                    </span>
                    {tag}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
