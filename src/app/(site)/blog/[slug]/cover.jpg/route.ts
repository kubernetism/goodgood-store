import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { blogCoverResponse } from "@/features/social-card/card-images";

/** The post's cover photo at card size: originals can be megabytes, and WhatsApp drops those. */
export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "coming-soon" }];
}

export async function GET(_request: Request, { params }: RouteContext<"/blog/[slug]/cover.jpg">) {
  const { slug } = await params;
  return blogCoverResponse(slug);
}
