import { Container } from "@/components/ui/container";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { SlidingRow } from "@/components/ui/sliding-row";
import { SectionHeading } from "@/components/ui/section-heading";
import { BlogCard } from "@/features/blog/components/blog-card";
import { getLatestPosts } from "@/features/blog/queries";
import { blogCoverImage } from "@/features/content/content-data";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { cx } from "@/lib/cx";

/** Landing-page posts glide edge to edge; other pages keep the manual carousel. */
export async function LatestBlog({ background, autoSlide = false }: { background?: React.ReactNode; autoSlide?: boolean }) {
  const posts = await getPublishedBlogPosts();
  const items = getLatestPosts(posts, 6).map((post) => ({
    key: post.slug,
    content: <BlogCard post={post} cover={blogCoverImage(post)} />,
  }));
  if (!items.length) return null;
  return (
    <section
      aria-labelledby="latest-blog-heading"
      className={cx("py-16 lg:py-30", Boolean(background) && "relative isolate")}
    >
      {background}
      <Container>
        <SectionHeading id="latest-blog-heading" title="Latest Blog" className="reveal" />
        {!autoSlide && <ScrollCarousel
          label="Latest blog posts"
          showArrows
          className="mt-8"
          itemClassName="basis-[85%] sm:basis-[calc(50%-0.75rem)] lg:basis-[calc((100%-3rem)/3)]"
          items={items}
        />}
      </Container>
      {autoSlide && items.length <= 2 && <div className="mx-auto mt-8 w-full px-4 sm:px-6"><ul aria-label="Latest blog posts" className={cx("mx-auto grid gap-4 sm:gap-6", items.length === 1 ? "max-w-[25rem] grid-cols-1" : "max-w-[51.5rem] grid-cols-2")}>{items.map((item) => <li key={item.key}>{item.content}</li>)}</ul></div>}
      {autoSlide && items.length > 2 && <SlidingRow label="Latest blog posts" fullWidth={items.length > 4} className="mt-8" items={items} />}
    </section>
  );
}
