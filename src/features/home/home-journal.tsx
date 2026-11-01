import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HoneyDivider } from "@/components/motifs/honey-divider";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { StoryCard } from "@/features/blog/components/story-card";
import { getLatestPosts } from "@/features/blog/queries";
import { blogCoverImage } from "@/features/content/content-data";

/** The three newest Honey Journal posts, in the Journal's own card style. */
export async function HomeJournal() {
  const posts = getLatestPosts(await getPublishedBlogPosts(), 3);
  if (!posts.length) return null;

  return (
    <section aria-labelledby="journal-heading" className="overflow-clip py-16 lg:py-24">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="reveal">
          <Eyebrow decorated="leading">From the journal</Eyebrow>
          <h2 id="journal-heading" className="mt-3 text-h2-sm font-semibold lg:text-h2">
            Notes from the <span className="font-script text-[1.3em] leading-none font-normal text-primary-ink">hive</span>
          </h2>
          <HoneyDivider className="mt-4" />
        </div>
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-sm font-semibold text-strong underline decoration-primary decoration-2 underline-offset-4 transition-colors duration-200 hover:text-primary-ink sm:self-end"
        >
          Read the journal
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
      <div className="home-rail mt-10 sm:mx-auto sm:max-w-page sm:px-6">
        <ul
          aria-label="Latest journal posts"
          className="scrollbar-none reveal flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pt-2 pb-4 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <li key={post.slug} className="w-[80%] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <StoryCard post={post} cover={blogCoverImage(post)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
