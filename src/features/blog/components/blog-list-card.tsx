import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { MediaImage } from "@/components/ui/media-image";
import type { ImageAsset } from "@/features/products/types";
import { formatDate } from "@/lib/format";
import { blogAuthor, type BlogPost } from "../data";
import { getBlogCategoryName } from "../queries";
import { BlogMetricsDisplay } from "./blog-metrics";

/** Blog listing entry (mockup: Blog Right Sidebar). */
type BlogListCardProps = { post: BlogPost; cover: ImageAsset | null; authorPhoto: ImageAsset | null };

export function BlogListCard({ post, cover, authorPhoto }: BlogListCardProps) {
  return (
    <article className="group relative border border-border">
      <div className="relative">
        <div className="overflow-hidden">
          <MediaImage
            image={cover}
            alt=""
            sizes="(min-width: 1024px) 770px, 100vw"
            icon={HoneyDipperIcon}
            iconSize="lg"
            aspect="aspect-[5/3]"
            className="transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        </div>
        <span className="absolute -bottom-4 left-0 inline-flex h-8 items-center bg-primary px-3 font-display text-meta font-semibold text-strong">
          {getBlogCategoryName(post.category)}
        </span>
      </div>
      <div className="p-5 pt-9 sm:px-6">
        <h2 className="text-h4 font-semibold text-pretty sm:text-h3">
          <Link href={`/blog/${post.slug}`} className="transition-colors duration-200 hover:text-primary-ink">
            {post.title}
          </Link>
        </h2>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-display text-meta font-semibold text-strong">
          <BlogMetricsDisplay slug={post.slug} />
          <li className="flex items-center gap-2">
            <Calendar className="size-4 text-primary-ink" aria-hidden="true" />
            <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
          </li>
        </ul>
        <p className="mt-5 text-strong">{post.excerpt}</p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 font-display text-meta font-semibold text-strong">
            {post.author === blogAuthor.name ? (
              <MediaImage image={authorPhoto} alt="" sizes="28px" icon={User} iconSize="sm" rounded="full" className="size-7" />
            ) : (
              <ImagePlaceholder icon={User} iconSize="sm" rounded="full" className="size-7" />
            )}
            By: {post.author}
          </p>
          <Link
            href={`/blog/${post.slug}`}
            className="flex min-h-11 items-center gap-2 font-display text-meta font-semibold text-strong transition-colors duration-200 hover:text-primary-ink"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
            Read more<span className="sr-only">: {post.title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
