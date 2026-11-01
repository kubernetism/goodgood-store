import Image from "next/image";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { localImages } from "@/content/local-images";
import type { ImageAsset } from "@/features/products/types";
import { siteConfig } from "@/lib/site";
import type { YouTubeVideo } from "@/lib/youtube";
import { VideoBlock } from "./video-block";

/** Three of the hive-to-jar steps, worded as on the About page. */
const steps = [
  { title: "Kept by beekeepers we know", text: "Hives move with the bloom across Khyber Pakhtunkhwa, Punjab and Gilgit-Baltistan." },
  { title: "Cold-extracted, cloth-strained", text: "No heating, no blending, no syrups, ever." },
  { title: "Checked before it is jarred", text: "Each batch is tested for moisture and common adulterants." },
] as const;

type StoryTeaserProps = {
  /** The "home.story" slot image (video poster, or the still when there is no video). */
  image: ImageAsset | null;
  video: YouTubeVideo | null;
};

/**
 * Honey band teasing the brand story and purity promise, ending in the page's
 * second (and last) drip. The admin's "From hive to jar" video plays in a
 * modal when set; otherwise the slot photo (or the range showcase) is shown.
 */
export function StoryTeaser({ image, video }: StoryTeaserProps) {
  const still = image ?? localImages.showcase;

  return (
    <>
      <section aria-labelledby="story-heading" className="relative isolate overflow-clip bg-honey-300 pt-16 pb-10 text-strong lg:pt-24 lg:pb-14">
        <HoneycombPattern fade className="text-strong/[0.08]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="reveal lg:col-span-6">
              {/* Brown, not the amber eyebrow ink: amber on this honey fill is under 4.5:1. */}
              <p className="inline-flex items-center gap-3 font-subtitle text-eyebrow font-bold text-strong uppercase">
                <span aria-hidden="true" className="h-px w-6 bg-current opacity-60" />
                Our story
              </p>
              <h2 id="story-heading" className="mt-3 text-h2-sm font-semibold lg:text-cta">
                From the hive to your <span className="font-script text-[1.3em] leading-none font-normal">table</span>
              </h2>
              <p className="mt-5 max-w-lg font-subtitle text-base text-strong">
                {siteConfig.legalName} works with beekeepers across Pakistan to bring you honey that is raw, tested and
                traceable to the hive it came from.
              </p>
              <ButtonLink href="/about" variant="dark" className="mt-8 w-full sm:w-auto">
                Read our story
              </ButtonLink>
            </div>
            <ol className="reveal border-t-2 border-strong lg:col-span-6 lg:self-end">
              {steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-3 border-b border-strong/25 py-4 sm:grid-cols-[4rem_1fr]">
                  <span aria-hidden="true" className="home-step__no text-[2rem] leading-none text-strong/70 sm:text-[2.5rem]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-subtitle text-base font-bold text-strong sm:text-lg">{step.title}</h3>
                    <p className="mt-0.5 text-sm text-strong">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="reveal home-story__media mt-12 overflow-hidden rounded-lg lg:mt-16">
            {video ? (
              <VideoBlock poster={image} video={video} title="Our beekeeping story: from hive to jar" />
            ) : (
              <Image
                src={still.url}
                alt={still.alt}
                width={still.width ?? 1600}
                height={still.height ?? 900}
                sizes="(min-width: 1200px) 1170px, 100vw"
                className="h-auto w-full"
              />
            )}
          </div>
        </Container>
      </section>
      <HoneyDrip size="lg" className="relative z-10 -mt-px text-honey-300" />
    </>
  );
}
