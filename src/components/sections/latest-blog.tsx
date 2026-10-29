import { Container } from "@/components/ui/container";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { SlidingRow } from "@/components/ui/sliding-row";
import { SectionHeading } from "@/components/ui/section-heading";
import { BlogCard } from "@/features/blog/components/blog-card";
import { getLatestPosts } from "@/features/blog/queries";
import { blogCoverSlotKey } from "@/features/content/slots";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { cx } from "@/lib/cx";

/** Landing-page posts glide edge to edge; other pages keep the manual carousel. */
export async function LatestBlog({ background, autoSlide = false }: { background?: React.ReactNode; autoSlide?: boolean }) {
  const content = await getSiteContent();
  const items = getLatestPosts(6).map((post) => ({
    key: post.slug,
    content: <BlogCard post={post} cover={slotImage(content, blogCoverSlotKey(post.slug))} />,
  }));
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
      {autoSlide && <SlidingRow label="Latest blog posts" fullWidth className="mt-8" items={items} />}
    </section>
  );
}
