import Link from "next/link";
import { Calendar, Tag, User } from "lucide-react";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "../data";
import { getBlogCategoryName } from "../queries";

/** DS blog card: image, author/category meta, 2-line title, date + Read more. */
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface shadow-card">
      <div className="overflow-hidden">
        <ImagePlaceholder
          icon={HoneyDipperIcon}
          aspect="aspect-[10/7]"
          className="transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-display text-meta font-semibold text-strong">
          <li className="flex items-center gap-1.5">
            <User className="size-3.5 text-primary-ink" aria-hidden="true" />
            <span className="sr-only">Author: </span>
            by {post.author.split(" ")[0]}
          </li>
          <li className="flex items-center gap-1.5">
            <Tag className="size-3.5 text-primary-ink" aria-hidden="true" />
            <span className="sr-only">Category: </span>
            {getBlogCategoryName(post.category)}
          </li>
        </ul>
        <h3 className="mt-4 line-clamp-2 text-promo font-semibold text-pretty">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-200 group-hover:text-primary-ink after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="flex items-center gap-1.5 font-display text-meta font-semibold text-strong">
            <Calendar className="size-3.5 text-primary-ink" aria-hidden="true" />
            <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
          </p>
          <span aria-hidden="true" className="font-display text-meta font-semibold text-primary-ink uppercase">
            Read more
          </span>
        </div>
      </div>
    </article>
  );
}
