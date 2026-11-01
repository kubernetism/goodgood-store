import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { buttonClasses } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { MediaImage } from "@/components/ui/media-image";
import type { ImageAsset } from "@/features/products/types";
import { formatDate } from "@/lib/format";
import { blogAuthor, type BlogPost } from "../data";
import { estimateReadingMinutes, formatReadingMinutes } from "../editorial";
import { getBlogCategoryName } from "../queries";
import { BlogMetricsDisplay } from "./blog-metrics";

type FeaturedStoryProps = { post: BlogPost; cover: ImageAsset | null; authorPhoto: ImageAsset | null };

/** Lead story on the journal's first page: large photo, serif standfirst, byline and live reader stats. */
export function FeaturedStory({ post, cover, authorPhoto }: FeaturedStoryProps) {
  const href = `/blog/${post.slug}`;
  return (
    <article
      aria-labelledby="lead-story-title"
      className="journal-card group relative isolate grid overflow-hidden rounded-lg bg-cream lg:grid-cols-12 lg:items-center"
    >
      <HoneycombPattern fade className="text-primary-ink/[0.06]" />
      <div className="relative lg:col-span-7">
        <div className="journal-card__media overflow-hidden">
          <MediaImage
            image={cover}
            alt=""
            sizes="(min-width: 1170px) 680px, (min-width: 1024px) 58vw, 100vw"
            preload
            icon={HoneyDipperIcon}
            iconSize="xl"
            aspect="aspect-[4/3] lg:aspect-[5/4]"
          />
        </div>
        <p className="absolute top-4 left-4 inline-flex h-8 items-center gap-2 rounded-full bg-primary px-3.5 font-subtitle text-eyebrow font-bold text-strong uppercase shadow-card">
          <span aria-hidden="true" className="journal-hex inline-block size-2.5 bg-strong" />
          Lead story
        </p>
      </div>

      <div className="px-5 py-7 sm:px-8 sm:py-9 lg:col-span-5 lg:px-10 lg:py-12">
        <p className="font-subtitle text-eyebrow font-bold text-primary-ink uppercase">
          <span className="sr-only">Category: </span>
          {getBlogCategoryName(post.category)}
        </p>
        <h2 id="lead-story-title" className="mt-3 font-heading text-h2-sm font-semibold text-pretty lg:text-h3 xl:text-h2">
          <Link href={href} className="decoration-primary decoration-2 underline-offset-4 hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="journal-standfirst mt-4 text-lg text-body">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-3">
          {post.author === blogAuthor.name ? (
            <MediaImage image={authorPhoto} alt="" sizes="44px" icon={User} iconSize="sm" rounded="full" className="size-11 shrink-0" />
          ) : (
            <ImagePlaceholder icon={User} iconSize="sm" rounded="full" className="size-11 shrink-0" />
          )}
          <div className="font-display text-meta">
            <p className="font-semibold text-strong">By {post.author}</p>
            <p className="text-muted">
              <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
              <span aria-hidden="true"> · </span>
              {formatReadingMinutes(estimateReadingMinutes(post))}
            </p>
          </div>
        </div>

        <ul aria-label="Reader stats" className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 font-display text-meta font-medium text-body">
          <BlogMetricsDisplay slug={post.slug} />
        </ul>

        <Link href={href} className={buttonClasses({ variant: "dark", className: "mt-7 w-full sm:w-auto" })}>
          Read the story
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  );
}
