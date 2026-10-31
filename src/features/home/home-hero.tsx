import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { HoneycombParallax } from "@/features/home/honeycomb-parallax";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { localImages } from "@/content/local-images";
import { HeroBackground } from "./hero-background";
import type { StorefrontBanner } from "@/features/banners/model";
import type { ImageAsset } from "@/features/products/types";

const proofPoints = [
  { icon: MapPin, label: "Single-origin" },
  { icon: ShieldCheck, label: "Lab-tested" },
  { icon: BadgeCheck, label: "Never heated" },
] as const;

const headingClass =
  "mt-6 max-w-xl font-heading text-[1.875rem] leading-[1.2] font-semibold text-on-dark sm:text-[2.5rem] lg:text-[3.125rem]";

type HomeHeroProps = {
  /** Active hero banner from the admin; null keeps the default copy. */
  banner: StorefrontBanner | null;
  /** The "home.hero" content slot, used when the banner has no image. */
  slotImage: ImageAsset | null;
};

/**
 * Photo-led hero. Banner copy and uploaded artwork still take precedence;
 * the shop display from the supplied images folder is the local fallback.
 */
export function HomeHero({ banner, slotImage }: HomeHeroProps) {
  const image = banner?.image ?? slotImage ?? localImages.shop;

  return (
    <section id="home-hero" aria-labelledby="hero-heading" className="home-photo-hero on-dark relative isolate overflow-hidden bg-brown-950">
        <HeroBackground image={image} />
        <HoneycombParallax tone="dark" />
        <Container className="relative flex min-h-[39rem] items-center pt-32 pb-12 sm:min-h-[41rem] lg:pt-36 lg:pb-16">
          <div className="home-photo-hero__copy max-w-xl animate-fade-up motion-reduce:animate-none">
            <p className="inline-flex items-center gap-2 rounded-full bg-ivory/70 px-3.5 py-1.5 font-subtitle text-meta font-bold text-strong">
              <BeeIcon className="size-4" strokeWidth={1.75} />
              Raw honey from Pakistani beekeepers
            </p>
            {banner ? (
              <>
                <h1 id="hero-heading" className={headingClass}>
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="mt-6 max-w-lg font-subtitle text-lg leading-relaxed text-on-dark">{banner.subtitle}</p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  {banner.ctaLabel && banner.ctaHref && (
                    <ButtonLink href={banner.ctaHref}>
                      {banner.ctaLabel}
                    </ButtonLink>
                  )}
                  {banner.ctaHref !== "/shop" && (
                    <ButtonLink href="/shop" variant="outline-dark">
                      Shop all honey
                    </ButtonLink>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 id="hero-heading" className={headingClass}>
                  Golden by nature, <span className="font-bold">raw</span> by choice.
                </h1>
                <p className="mt-6 max-w-lg font-subtitle text-lg leading-relaxed text-on-dark">
                  Small-batch Sidr, Acacia and wildflower honey from apiaries we know by name. Cold-extracted, never
                  blended, jarred in Pakistan.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/shop">
                    Shop all honey
                  </ButtonLink>
                  <ButtonLink href="/shop?category=gift-sets" variant="outline-dark">
                    Explore gift sets
                  </ButtonLink>
                </div>
              </>
            )}
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-on-dark">
              {proofPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </Container>
    </section>
  );
}
