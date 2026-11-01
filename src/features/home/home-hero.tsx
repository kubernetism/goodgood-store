import Link from "next/link";
import { Banknote, FlaskConical, Truck } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { localImages } from "@/content/local-images";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { categoryIcon } from "@/features/products/category-icons";
import type { StorefrontBanner } from "@/features/banners/model";
import type { ImageAsset, Product } from "@/features/products/types";
import { HeroBackground } from "./hero-background";
import { HoneycombParallax } from "./honeycomb-parallax";

/** Claims reused from the store promises (delivery, COD, purity). */
const proofPoints = [
  { icon: Banknote, label: "Cash on delivery" },
  { icon: Truck, label: "Delivery across Pakistan" },
  { icon: FlaskConical, label: "Lab-tested batches" },
] as const;

const DEFAULT_SUBTITLE =
  "Small-batch Sidr, Acacia and wildflower honey from apiaries we know by name. Cold-extracted, never blended, jarred in Pakistan.";

const headingClass = "mt-5 font-heading text-[2.25rem] leading-[1.12] font-semibold text-balance text-on-dark sm:text-[2.875rem] lg:text-[3.5rem]";

type HomeHeroProps = {
  /** Active hero banner from the admin; null keeps the default copy. */
  banner: StorefrontBanner | null;
  /** The "home.hero" content slot, used when the banner has no image. */
  slotImage: ImageAsset | null;
  /** The jar on the label card; null hides the card (nothing in stock). */
  product: Product | null;
};

/**
 * Photo hero: the banner/slot photo fills the background under an 80% brown
 * overlay (20% of the photo shows through). Beside the copy, a paper jar label
 * with a scroll-turned stamp sells the featured honey without leaving the fold.
 * Banner copy and artwork take precedence over the defaults. The H1 never
 * animates in (it competes for LCP with the background photo).
 */
export function HomeHero({ banner, slotImage, product }: HomeHeroProps) {
  const image = banner?.image ?? slotImage ?? localImages.shop;
  const subtitle = banner ? banner.subtitle : DEFAULT_SUBTITLE;

  return (
    <>
      <section
        id="home-hero"
        aria-labelledby="hero-heading"
        className="on-dark relative isolate overflow-clip bg-brown-950 text-on-dark"
      >
        <HeroBackground image={image} />
        <HoneycombParallax tone="dark" />
        <Container className="grid items-center gap-12 pt-28 pb-14 sm:pt-32 lg:grid-cols-12 lg:gap-8 lg:pt-40 lg:pb-24">
          <div className="home-hero__copy lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-honey-300/40 bg-on-dark/5 px-3.5 py-1.5 font-subtitle text-meta font-bold text-on-dark">
              <BeeIcon className="size-4 text-honey-300" strokeWidth={1.75} />
              Raw honey from Pakistani beekeepers
            </p>
            {banner ? (
              <h1 id="hero-heading" className={headingClass}>
                {banner.title}
              </h1>
            ) : (
              <h1 id="hero-heading" className={headingClass}>
                Golden by nature,{" "}
                <span className="font-script text-[1.3em] leading-none font-normal text-honey-300">raw</span> by choice.
              </h1>
            )}
            {subtitle && (
              <p className="mt-5 max-w-[34rem] font-subtitle text-base leading-relaxed text-on-dark-muted sm:text-lg">{subtitle}</p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {banner?.ctaLabel && banner.ctaHref ? (
                <ButtonLink href={banner.ctaHref} className="w-full sm:w-auto">
                  {banner.ctaLabel}
                </ButtonLink>
              ) : null}
              {banner?.ctaHref !== "/shop" && (
                <ButtonLink href="/shop" variant={banner?.ctaLabel ? "outline-dark" : "primary"} className="w-full sm:w-auto">
                  Shop all honey
                </ButtonLink>
              )}
              {!banner && (
                <ButtonLink href="/about" variant="outline-dark" className="w-full sm:w-auto">
                  Our story
                </ButtonLink>
              )}
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 font-display text-sm font-semibold text-on-dark">
              {proofPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4 text-honey-300" strokeWidth={2} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {product && (
            <div className="relative mx-auto w-[min(100%,20rem)] sm:w-[22rem] lg:col-span-5 lg:mr-4 lg:w-[22.5rem] lg:justify-self-end">
              <JarLabel product={product} />
              <Stamp />
            </div>
          )}
        </Container>
      </section>
      <HoneyDrip size="md" className="relative z-10 -mt-px text-brown-950" />
    </>
  );
}

/** Round seal; the ring turns as the page scrolls (static under reduced motion). */
function Stamp() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className="home-stamp absolute -top-7 -right-4 size-24 sm:-right-9 sm:size-28"
    >
      <defs>
        <path id="home-stamp-ring" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
      </defs>
      <circle cx="50" cy="50" r="49" fill="#e5b45a" />
      <circle cx="50" cy="50" r="45.5" fill="none" stroke="#2b1d0e" strokeOpacity="0.45" strokeWidth="0.75" />
      <g className="home-stamp__ring">
        <text className="font-subtitle" fill="#2b1d0e" fontSize="8.4" fontWeight="700" letterSpacing="1.4">
          <textPath href="#home-stamp-ring" textLength="230" lengthAdjust="spacing">
            RAW HONEY · CASH ON DELIVERY · PAKISTAN ·
          </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="25" fill="#2b1d0e" />
      <path d="M50 32l15.6 9v18L50 68l-15.6-9V41Z" fill="none" stroke="#e5b45a" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Nested SVG: the shared bee glyph, centred in the seal. */}
      <BeeIcon x="39" y="38" width="22" height="22" stroke="#e5b45a" strokeWidth={1.75} />
    </svg>
  );
}

/** Paper jar label for the featured honey: photo, name, weight, rating, PKR price and add to cart. */
function JarLabel({ product }: { product: Product }) {
  return (
    <aside aria-label="Featured honey" className="home-label text-strong">
      <div className="home-label__card relative rounded-lg bg-ivory p-4 sm:p-5">
        <MediaImage
          image={product.images[0]}
          alt=""
          sizes="(min-width: 640px) 320px, 288px"
          // The largest paint on phones (the background photo is on desktop).
          preload
          icon={categoryIcon(product.category)}
          iconSize="xl"
          tone="honey"
          aspect="aspect-[5/4]"
          className="home-arch"
        />
        <div className="px-1 pt-4">
          <p className="flex items-center gap-2 font-subtitle text-eyebrow font-bold text-primary-ink uppercase">
            <span aria-hidden="true" className="home-hex inline-block size-2.5 bg-primary-ink" />
            Our pick · {product.categoryName}
          </p>
          <p className="mt-1.5 font-heading text-xl leading-snug font-semibold text-pretty">
            <Link href={`/shop/${product.slug}`} className="rounded-sm underline-offset-4 hover:underline">
              {product.name}
            </Link>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-meta text-muted">
            <span>{product.unit}</span>
            <RatingStars rating={product.rating} />
          </p>
          <div className="mt-3 border-t border-dashed border-strong/30 pt-3">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
            <AddToCartButton slug={product.slug} productName={product.name} variant="full" className="mt-3 w-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
