import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { MediaImage } from "@/components/ui/media-image";
import { blogCoverImage, getSiteContent } from "@/features/content/content-data";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { BlogSidebar } from "@/features/blog/components/blog-sidebar";
import { BlogMetricsDisplay } from "@/features/blog/components/blog-metrics";
import { BlogVisitTracker } from "@/features/blog/components/blog-visit-tracker";
import { blogAuthorImage } from "@/features/blog/author-image";
import { blogAuthor, type BlogBlock } from "@/features/blog/data";
import { blogHref, getAdjacentPosts, getBlogCategoryName, getPostBySlug } from "@/features/blog/queries";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateStaticParams() {
  return (await getPublishedBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(await getPublishedBlogPosts(), slug);
  if (!post) return { title: "Post not found" };
  const cover = blogCoverImage(post);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedOn,
      authors: [post.author],
      ...(cover ? { images: [{ url: cover.url, alt: cover.alt }] } : {}),
    },
  };
}

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <>
      <PageHero
        title="Blog Details"
        titleAs="p"
        eyebrow="Stories from the hive"
        crumbs={[{ label: "Blog", href: "/blog" }, { label: "Blog Details" }]}
      />
      <Suspense fallback={<PostSkeleton />}>
        <PostContent params={params} />
      </Suspense>
    </>
  );
}

async function PostContent({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const [{ slug }, content, posts] = await Promise.all([params, getSiteContent(), getPublishedBlogPosts()]);
  const post = getPostBySlug(posts, slug);
  if (!post) notFound();

  const { previous, next } = getAdjacentPosts(posts, post.slug);

  return (
    <Container className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-6 lg:py-24">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedOn,
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: siteConfig.contact.businessName },
        mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
        ...(blogCoverImage(post) ? { image: [new URL(blogCoverImage(post)!.url, siteConfig.url).toString()] } : {}),
      }} />
      <article id="blog-article" className="lg:col-span-8">
        <BlogVisitTracker slug={post.slug} />
        <div className="relative">
          <MediaImage
            image={blogCoverImage(post)}
            sizes="(min-width: 1024px) 770px, 100vw"
            preload
            icon={HoneyDipperIcon}
            iconSize="lg"
            aspect="aspect-[5/3]"
            rounded="md"
          />
          <Link
            href={blogHref({ category: null, tag: null, q: "", page: 1 }, { category: post.category })}
            className="absolute -bottom-4 left-0 inline-flex h-8 items-center bg-primary px-3 font-display text-meta font-semibold text-strong hover:bg-primary-hover"
          >
            {getBlogCategoryName(post.category)}
          </Link>
        </div>

        <header className="mt-10">
          <h1 className="text-h3 font-semibold text-pretty lg:text-cta">{post.title}</h1>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-display text-meta font-semibold text-strong">
            <li className="flex items-center gap-2">
              <User className="size-4 text-primary-ink" aria-hidden="true" />
              By {post.author}
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="size-4 text-primary-ink" aria-hidden="true" />
              <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
            </li>
            <BlogMetricsDisplay slug={post.slug} />
          </ul>
        </header>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-strong">
          <p className="text-h4 font-medium text-body">{post.excerpt}</p>
          {post.body.map((block, index) => (
            <PostBlock key={index} block={block} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-border py-5">
          <span className="font-display text-sm font-semibold text-strong">Tags:</span>
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={blogHref({ category: null, tag: null, q: "", page: 1 }, { tag })}
                  className="inline-flex min-h-9 items-center bg-cream px-3 font-display text-meta font-semibold text-strong hover:bg-primary"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {post.author === blogAuthor.name && <aside aria-label="About the author" className="mt-10 flex gap-5 rounded-sm bg-cream p-6">
          <MediaImage
            image={blogAuthorImage(content)}
            alt=""
            sizes="80px"
            icon={User}
            rounded="full"
            className="size-20 shrink-0"
          />
          <div>
            <p className="font-display text-base font-semibold text-strong">{blogAuthor.name}</p>
            <p className="text-meta text-primary-ink">{blogAuthor.role}</p>
            <p className="mt-2 text-sm">{blogAuthor.bio}</p>
          </div>
        </aside>}

        <nav aria-label="More posts" className="mt-10 grid gap-4 sm:grid-cols-2">
          {previous && (
            <Link href={`/blog/${previous.slug}`} className="group rounded-sm border border-border p-5 hover:border-primary">
              <span className="flex items-center gap-2 font-display text-meta font-semibold text-primary-ink">
                <ArrowLeft className="size-4" aria-hidden="true" /> Previous post
              </span>
              <span className="mt-2 block font-display font-semibold text-strong group-hover:text-primary-ink">
                {previous.title}
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="group rounded-sm border border-border p-5 text-right hover:border-primary sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-2 font-display text-meta font-semibold text-primary-ink">
                Next post <ArrowRight className="size-4" aria-hidden="true" />
              </span>
              <span className="mt-2 block font-display font-semibold text-strong group-hover:text-primary-ink">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>

      <aside aria-label="Blog sidebar" className="lg:col-span-4">
        <BlogSidebar activeCategory={post.category} />
      </aside>
    </Container>
  );
}

function PostBlock({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return <h2 className="pt-4 text-promo font-semibold">{block.text}</h2>;
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-6 marker:text-primary-ink">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <figure className="border-l-4 border-primary bg-primary-tint px-6 py-5">
          <blockquote className="font-serif text-promo text-strong">“{block.text}”</blockquote>
          {block.cite && <figcaption className="mt-2 text-meta font-semibold text-primary-ink">— {block.cite}</figcaption>}
        </figure>
      );
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

function PostSkeleton() {
  return (
    <Container className="py-16 lg:py-24" aria-busy="true" aria-label="Loading post">
      <div className="space-y-6 lg:w-2/3">
        <div className="aspect-[5/3] animate-pulse rounded-sm bg-tile" />
        <div className="h-10 w-3/4 animate-pulse rounded-sm bg-tile" />
        <div className="h-40 animate-pulse rounded-sm bg-tile" />
      </div>
    </Container>
  );
}
