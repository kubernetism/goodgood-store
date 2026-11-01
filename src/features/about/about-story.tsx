import { User } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section-heading";
import type { ImageAsset } from "@/features/products/types";
import { siteConfig } from "@/lib/site";
import { aboutStats, foundedYear } from "./about-content";

type AboutStoryProps = { apiaries: ImageAsset | null; team: ImageAsset | null };

/** Origin story: offset photo pair (admin slots) beside editorial copy with a drop cap and the founder's signature. */
export function AboutStory({ apiaries, team }: AboutStoryProps) {
  return (
    <section id="story" aria-labelledby="story-heading" className="pt-10 pb-16 lg:pt-16 lg:pb-28">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="relative mx-auto grid w-full max-w-[34rem] grid-cols-[1.15fr_1fr] gap-4 sm:gap-6 lg:col-span-6 lg:mr-6 lg:max-w-none">
          <MediaImage
            image={apiaries}
            sizes="(min-width: 1024px) 300px, 55vw"
            icon={BeeIcon}
            iconSize="lg"
            rounded="lg"
            aspect="aspect-[3/5]"
            caption="Our apiaries"
          />
          <MediaImage
            image={team}
            sizes="(min-width: 1024px) 260px, 45vw"
            icon={User}
            iconSize="lg"
            rounded="lg"
            aspect="aspect-[3/5]"
            caption="Our team"
            className="mt-14 sm:mt-20"
          />
          {/* Hexagon seal straddling the two photos. */}
          <span
            aria-hidden="true"
            className="about-hex absolute top-[38%] left-[53%] flex size-20 -translate-x-1/2 flex-col items-center justify-center bg-primary text-strong sm:size-24"
          >
            {foundedYear ? (
              <>
                <span className="text-eyebrow font-bold uppercase">Since</span>
                <span className="font-heading text-lg leading-none font-bold sm:text-xl">{foundedYear}</span>
              </>
            ) : (
              <BeeIcon className="size-8 sm:size-9" strokeWidth={1.5} />
            )}
          </span>
        </div>

        <div className="lg:col-span-6">
          <Eyebrow decorated="leading">How it started</Eyebrow>
          <h2 id="story-heading" className="mt-3 text-h2-sm font-semibold lg:text-cta">
            It began with a handful of hives
          </h2>
          <p className="about-dropcap mt-8 text-base leading-relaxed text-strong">
            Abdul Sami started with a few hives and a simple promise: honey that is raw, traceable and sold exactly as
            the bees made it. No shortcuts at the hive, and none in the jar.
          </p>
          <p className="about-pullquote mt-8 border-l-2 border-primary pl-5 font-serif text-xl leading-snug text-strong italic lg:text-2xl">
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

          <div className="mt-10 flex flex-wrap items-end gap-x-5 gap-y-2">
            <p aria-hidden="true" className="font-script text-[2.25rem] leading-none whitespace-nowrap text-primary-ink sm:text-[2.75rem]">
              Abdul Sami
            </p>
            <div className="border-l border-border-strong/50 pb-1 pl-5">
              <p className="font-display text-base font-semibold text-strong">Abdul Sami</p>
              <p className="text-meta">Founder &amp; beekeeper</p>
            </div>
          </div>

          {aboutStats.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-3">
              {aboutStats.map(({ value, label }) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className="text-meta text-muted">{label}</dt>
                  <dd className="font-heading text-stat font-bold text-strong tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </section>
  );
}
