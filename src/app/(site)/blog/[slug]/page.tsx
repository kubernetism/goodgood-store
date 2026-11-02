import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock3, User } from "lucide-react";
import { Breadcrumbs, PageHeroBackground } from "@/components/layout/page-hero";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { Container } from "@/components/ui/container";
import { HoneycombLoader } from "@/components/ui/honeycomb-mark";
import { HoneyDipperIcon } from "@/components/icons/honey-icons";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section-heading";
import { blogCoverImage, getSiteContent } from "@/features/content/content-data";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { BlogMetricsDisplay } from "@/features/blog/components/blog-metrics";
import { BlogVisitTracker } from "@/features/blog/components/blog-visit-tracker";
import { PostBody, PostContents } from "@/features/blog/components/post-body";
import { ShopCta } from "@/features/blog/components/shop-cta";
import { StoryCard } from "@/features/blog/components/story-card";
import { blogAuthorImage } from "@/features/blog/author-image";
import { blogAuthor } from "@/features/blog/data";
import { estimateReadingMinutes, formatReadingMinutes, getRelatedPosts } from "@/features/blog/editorial";
import { blogHref, getAdjacentPosts, getBlogCategoryName, getPostBySlug } from "@/features/blog/queries";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import "@/features/blog/components/blog.css";
import { blogCoverCardImage } from "@/features/social-card/card-model";
import { baseOpenGraph } from "@/lib/social-metadata";

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
      ...baseOpenGraph,
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedOn,
      authors: [post.author],
      // A post's cover is its preview; without one the shared brand card stands in.
      ...(cover ? { images: [blogCoverCardImage(post.slug, cover.alt)] } : {}),
    },
  };
}

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostContent params={params} />
    </Suspense>
  );
}

const emptyQuery = { category: null, tag: null, q: "", page: 1 } as const;

async function PostContent({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const [{ slug }, content, posts] = await Promise.all([params, getSiteContent(), getPublishedBlogPosts()]);
  const post = getPostBySlug(posts, slug);
  if (!post) notFound();

  const { previous, next } = getAdjacentPosts(posts, post.slug);
  const related = getRelatedPosts(posts, post, 3);
  const cover = blogCoverImage(post);
  const categoryName = getBlogCategoryName(post.category);
  const categoryHref = blogHref(emptyQuery, { category: post.category });
  const isHouseAuthor = post.author === blogAuthor.name;
  const authorPhoto = blogAuthorImage(content);
  const readingTime = formatReadingMinutes(estimateReadingMinutes(post));

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedOn,
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: siteConfig.contact.businessName },
        mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
        ...(cover ? { image: [new URL(cover.url, siteConfig.url).toString()] } : {}),
      }} />
      <span aria-hidden="true" className="journal-progress" />

      <article id="blog-article">
        <BlogVisitTracker slug={post.slug} />

        {/* Title band: same verse background and id as PageHero, so the header turns transparent over it. */}
        <header id="page-hero" className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
          <PageHeroBackground prioritize />
          <div aria-hidden="true" className="journal-hero__scrim pointer-events-none absolute inset-0 -z-10 hidden md:block" />
          <Container className="pt-[calc(100vw/3+6rem)] pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32">
            <div className="journal-hero__copy max-w-4xl">
              <Breadcrumbs
                crumbs={[{ label: "Journal", href: "/blog" }, { label: categoryName, href: categoryHref }, { label: post.title }]}
                className="journal-crumbs mb-6"
              />
              <Link
                href={categoryHref}
                className="mb-4 inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/60 px-3.5 text-eyebrow font-bold text-primary uppercase transition-colors duration-200 hover:bg-primary hover:text-strong"
              >
                <span className="sr-only">More in </span>
                {categoryName}
              </Link>
              <h1 className="text-h2-sm font-semibold text-balance text-on-dark sm:text-display-sm lg:text-display">{post.title}</h1>
              <p className="journal-standfirst mt-5 max-w-2xl text-lg text-on-dark-muted lg:text-xl">{post.excerpt}</p>
              <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-on-dark">
                <li className="flex items-center gap-2.5">
                  {isHouseAuthor ? (
                    <MediaImage image={authorPhoto} alt="" sizes="36px" icon={User} iconSize="sm" tone="dark" rounded="full" className="size-9 ring-2 ring-primary/70" />
                  ) : (
                    <User className="size-4 text-primary" aria-hidden="true" />
                  )}
                  By {post.author}
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary" aria-hidden="true" />
                  <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
                </li>
                <li className="flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                  {readingTime}
                </li>
              </ul>
            </div>
          </Container>
        </header>
        <HoneyDrip size="md" className="relative z-10 -mt-px text-brown-950" />

        <Container>
          <div className="relative z-20 -mt-10 sm:-mt-14 lg:-mt-20">
            <MediaImage
              image={cover}
              sizes="(min-width: 1170px) 1122px, 100vw"
              preload
              icon={HoneyDipperIcon}
              iconSize="xl"
              aspect="aspect-[16/10] lg:aspect-[21/9]"
              rounded="lg"
              className="shadow-card-hover"
            />
          </div>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-6">
            <aside aria-label="About this story" className="lg:col-span-3">
              <div className="space-y-8 lg:sticky lg:top-28">
                <PostContents body={post.body} className="hidden lg:block" />
                <div>
                  <p className="text-eyebrow font-bold text-primary-ink uppercase">Reader stats</p>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-meta font-medium text-body lg:flex-col">
                    <BlogMetricsDisplay slug={post.slug} />
                  </ul>
                </div>
              </div>
            </aside>

            <div className="min-w-0 lg:col-span-8 lg:col-start-5">
              <PostBody body={post.body} />

              {post.tags.length > 0 && (
                <div className="mt-12 flex journal-measure flex-wrap items-center gap-3 border-t border-border pt-6">
                  <span className="text-eyebrow font-bold text-primary-ink uppercase">Tagged</span>
                  <ul className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={blogHref(emptyQuery, { tag })}
                          className="inline-flex min-h-9 items-center rounded-full bg-primary-tint px-3.5 text-meta font-semibold text-strong transition-colors duration-200 hover:bg-primary"
                        >
                          <span aria-hidden="true" className="mr-0.5 text-primary-ink">#</span>
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isHouseAuthor && (
                <aside aria-labelledby="author-heading" className="mt-10 flex journal-measure flex-col gap-5 rounded-lg bg-cream p-6 sm:flex-row sm:items-start sm:p-8">
                  <span className="journal-hex block w-fit shrink-0 bg-primary p-1">
                    <MediaImage image={authorPhoto} alt="" sizes="80px" icon={User} className="journal-hex size-20" />
                  </span>
                  <div>
                    <p className="text-eyebrow font-bold text-primary-ink uppercase">Written by</p>
                    <h2 id="author-heading" className="mt-1 text-promo font-bold">{blogAuthor.name}</h2>
                    <p className="text-meta font-semibold text-muted">{blogAuthor.role}</p>
                    <p className="mt-3 text-body">{blogAuthor.bio}</p>
                  </div>
                </aside>
              )}

              {(previous || next) && (
                <nav aria-label="More posts" className="mt-10 grid journal-measure gap-4 sm:grid-cols-2">
                  {previous && (
                    <Link href={`/blog/${previous.slug}`} className="group rounded-lg border border-border p-5 transition-colors duration-200 hover:border-primary hover:bg-primary-tint">
                      <span className="flex items-center gap-2 text-meta font-semibold text-primary-ink">
                        <ArrowLeft className="size-4 transition-transform duration-200 motion-safe:group-hover:-translate-x-1" aria-hidden="true" /> Previous story
                      </span>
                      <span className="mt-2 block font-bold text-pretty text-strong">{previous.title}</span>
                    </Link>
                  )}
                  {next && (
                    <Link
                      href={`/blog/${next.slug}`}
                      className="group rounded-lg border border-border p-5 text-right transition-colors duration-200 hover:border-primary hover:bg-primary-tint sm:col-start-2"
                    >
                      <span className="flex items-center justify-end gap-2 text-meta font-semibold text-primary-ink">
                        Next story <ArrowRight className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                      <span className="mt-2 block font-bold text-pretty text-strong">{next.title}</span>
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20 bg-ivory py-16 lg:mt-28 lg:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow decorated="leading">Keep reading</Eyebrow>
                <h2 id="related-heading" className="mt-3 text-h2-sm font-semibold lg:text-h2">More from the hive</h2>
              </div>
              <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-ink underline-offset-4 hover:underline">
                All stories <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} className="reveal">
                  <StoryCard post={item} cover={blogCoverImage(item)} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <Container className="py-16 lg:py-24">
        <ShopCta category={post.category} />
      </Container>
    </>
  );
}

function PostSkeleton() {
  return (
    <div aria-busy="true">
      <section id="page-hero" className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
        <PageHeroBackground />
        <Container className="pt-[calc(100vw/3+6rem)] pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32">
          <div className="max-w-4xl space-y-5">
            <div className="h-5 w-48 animate-pulse rounded-sm bg-on-dark/10" />
            <div className="h-14 w-full animate-pulse rounded-sm bg-on-dark/10 lg:h-20" />
            <div className="h-6 w-2/3 animate-pulse rounded-sm bg-on-dark/10" />
          </div>
        </Container>
      </section>
      <HoneyDrip size="md" className="relative z-10 -mt-px text-brown-950" />
      <Container>
        <div className="relative z-20 -mt-10 sm:-mt-14 lg:-mt-20">
          <ImagePlaceholder aspect="aspect-[16/10] lg:aspect-[21/9]" rounded="lg" icon={HoneyDipperIcon} iconSize="xl" />
          <HoneycombLoader label="Loading post…" showLabel className="absolute inset-0 justify-center" />
        </div>
        <div className="mx-auto mt-12 journal-measure space-y-4 pb-24">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-5 animate-pulse rounded-sm bg-tile" />
          ))}
        </div>
      </Container>
    </div>
  );
}
