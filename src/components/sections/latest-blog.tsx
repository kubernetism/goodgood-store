import { Container } from "@/components/ui/container";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import { BlogCard } from "@/features/blog/components/blog-card";
import { getLatestPosts } from "@/features/blog/queries";

/** "Latest Blog": three cards per view with green round arrows outside the row. */
export function LatestBlog() {
  return (
    <section aria-labelledby="latest-blog-heading" className="py-16 lg:py-30">
      <Container>
        <SectionHeading id="latest-blog-heading" title="Latest Blog" className="reveal" />
        <ScrollCarousel
          label="Latest blog posts"
          showArrows
          className="mt-8"
          itemClassName="basis-[85%] sm:basis-[calc(50%-0.75rem)] lg:basis-[calc((100%-3rem)/3)]"
          items={getLatestPosts(6).map((post) => ({ key: post.slug, content: <BlogCard post={post} /> }))}
        />
      </Container>
    </section>
  );
}
