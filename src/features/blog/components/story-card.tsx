import Link from "next/link";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { MediaImage } from "@/components/ui/media-image";
import type { ImageAsset } from "@/features/products/types";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "../data";
import { estimateReadingMinutes, formatReadingMinutes } from "../editorial";
import { getBlogCategoryName } from "../queries";

type StoryCardProps = {
  post: BlogPost;
  cover: ImageAsset | null;
  /** Heading level inside the surrounding section. */
  headingLevel?: "h2" | "h3";
};

/**
 * Journal grid entry: photo, section label, title, two-line excerpt, date and
 * read time. The whole card is one link target (the title's ::after covers it),
 * so screen readers hear a single, descriptive link.
 */
export function StoryCard({ post, cover, headingLevel: Heading = "h3" }: StoryCardProps) {
  return (
    <article className="journal-card group relative flex h-full flex-col">
      <div className="journal-card__media overflow-hidden rounded-md">
        <MediaImage
          image={cover}
          alt=""
          sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
          icon={HoneyDipperIcon}
          aspect="aspect-[4/3]"
          rounded="md"
        />
      </div>
      <p className="mt-5 flex items-center gap-2 text-eyebrow font-bold text-primary-ink uppercase">
        <span aria-hidden="true" className="journal-hex inline-block size-2.5 bg-primary-ink" />
        <span className="sr-only">Category: </span>
        {getBlogCategoryName(post.category)}
      </p>
      <Heading className="mt-2.5 text-promo font-semibold text-pretty">
        <Link
          href={`/blog/${post.slug}`}
          className="decoration-primary decoration-2 underline-offset-4 group-hover:underline after:absolute after:-inset-2 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-focus"
        >
          {post.title}
        </Link>
      </Heading>
      <p className="mt-3 line-clamp-2 text-body">{post.excerpt}</p>
      <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-4 text-meta font-semibold text-muted">
        <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
        <span aria-hidden="true">·</span>
        <span>{formatReadingMinutes(estimateReadingMinutes(post))}</span>
      </p>
    </article>
  );
}
