import { BeeIcon } from "@/components/icons/honey-icons";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section-heading";
import type { ImageAsset } from "@/features/products/types";
import { siteConfig } from "@/lib/site";
import { aboutStats, foundedYear } from "./about-content";

type AboutStoryProps = { founder: ImageAsset | null };

/** Origin story: the founder's portrait (admin slot) beside editorial copy with a drop cap and his signature. */
export function AboutStory({ founder }: AboutStoryProps) {
  return (
    <section id="story" aria-labelledby="story-heading" className="pt-10 pb-16 lg:pt-16 lg:pb-28">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="relative mx-auto w-[calc(100%-1.5rem)] max-w-[20rem] -translate-x-2 sm:w-full sm:max-w-[26rem] sm:translate-x-0 lg:col-span-5 lg:max-w-none">
          {/* Offset honey rule behind the photo, like a mount around a framed print. */}
          <span aria-hidden="true" className="about-portrait__frame absolute inset-0 rounded-lg" />
          <MediaImage
            image={founder}
            sizes="(min-width: 1024px) 460px, (min-width: 640px) 416px, 320px"
            icon={BeeIcon}
            iconSize="lg"
            rounded="lg"
            aspect="aspect-[4/5]"
            caption="Abdul Sami"
            className="relative shadow-card"
          />
          {/* Hexagon seal pinned to the portrait's lower corner. */}
          <span
            aria-hidden="true"
            className="about-hex absolute -right-3 -bottom-8 flex size-20 flex-col items-center justify-center bg-primary text-strong sm:-right-6 sm:size-24"
          >
            {foundedYear ? (
              <>
                <span className="text-eyebrow font-bold uppercase">Since</span>
                <span className="text-lg leading-none font-bold sm:text-xl">{foundedYear}</span>
              </>
            ) : (
              <BeeIcon className="size-8 sm:size-9" strokeWidth={1.5} />
            )}
          </span>
        </div>

        <div className="lg:col-span-7">
          <Eyebrow decorated="leading">How it started</Eyebrow>
          <h2 id="story-heading" className="mt-3 text-h2-sm font-semibold lg:text-cta">
            It began with a handful of hives
          </h2>
          <p className="about-dropcap mt-8 text-base leading-relaxed text-strong">
            Abdul Sami started with a few hives and a simple promise: honey that is raw, traceable and sold exactly as
            the bees made it. No shortcuts at the hive, and none in the jar.
          </p>
          <p className="about-pullquote mt-8 border-l-2 border-primary pl-5 font-quote text-xl leading-snug text-strong italic lg:text-2xl">
            If it isn&apos;t honest honey, it doesn&apos;t go in our jar.
          </p>
          <p className="mt-8">
            Today we work with beekeepers across Khyber Pakhtunkhwa, Punjab and Gilgit-Baltistan, paying fairly for each
            season&apos;s harvest and testing every batch before it is jarred.
          </p>
          <p className="mt-4">
            You&apos;ll find us at {siteConfig.contact.branch}, {siteConfig.contact.shortAddress}, where our team also
            handles {siteConfig.contact.businessType.toLowerCase()} enquiries.
          </p>

          <div className="mt-10">
            <p className="text-base font-semibold text-strong">Abdul Sami</p>
            <p className="text-meta">Founder &amp; beekeeper</p>
          </div>

          {aboutStats.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-3">
              {aboutStats.map(({ value, label }) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className="text-meta text-muted">{label}</dt>
                  <dd className="text-stat font-bold text-strong">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </section>
  );
}
