import { Gift } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { DiscountBadge, Price, discountPercent } from "@/components/ui/price";
import { Eyebrow } from "@/components/ui/section-heading";
import type { StorefrontBanner } from "@/features/banners/model";
import { getProductBySlug } from "@/features/products/catalog";
import type { Catalog, ImageAsset } from "@/features/products/types";
import { formatDate } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { DealCountdown } from "./deal-countdown";
import { HoneycombParallax } from "./honeycomb-parallax";

/** Shown when no deal banner is live (the original static promotion). */
const FALLBACK_DEAL_PRODUCT_SLUG = "honeycomb-gift-box";
const FALLBACK_DEAL_ENDS_AT = "2026-12-31";

type DealBandProps = {
  catalog: Catalog;
  banner: StorefrontBanner | null;
  /** "home.deal" slot image, used when the deal has no image of its own. */
  fallbackImage: ImageAsset | null;
};

/** Brown deal band: the live deal banner (or the gift-box fallback) with price and countdown. */
export function DealBand({ catalog, banner, fallbackImage }: DealBandProps) {
  const product = getProductBySlug(catalog, banner ? (banner.productSlug ?? "") : FALLBACK_DEAL_PRODUCT_SLUG);
  // Without a banner the band only makes sense for the original gift box.
  if (!banner && !product) return null;

  const percent = product ? discountPercent(product.price, product.compareAtPrice) : null;
  const image = banner?.image ?? fallbackImage ?? product?.images[0] ?? null;
  const title = banner?.title ?? "The Honeycomb Gift Box";
  const description = banner ? banner.subtitle : product?.summary;
  const endsAt = banner ? banner.endsAt : `${FALLBACK_DEAL_ENDS_AT}T23:59:59Z`;
  const endsAtLabel = banner
    ? banner.endsAt && `on ${formatPktDateTime(banner.endsAt)} (Pakistan time)`
    : `on ${formatDate(FALLBACK_DEAL_ENDS_AT)}`;
  const ctaHref = banner?.ctaHref || (product ? `/shop/${product.slug}` : "");
  const ctaLabel = banner?.ctaLabel || (banner ? "Shop the deal" : "Shop the gift box");

  return (
    <section aria-labelledby="deal-heading" className="on-dark relative isolate overflow-clip bg-brown-950 py-16 lg:py-24">
      <HoneycombParallax tone="dark" />
      <Container className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <div className="relative">
          <MediaImage
            image={image}
            sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
            icon={Gift}
            iconSize="xl"
            tone="dark"
            aspect="aspect-[5/4]"
            caption="Gift box photo coming soon"
            className="home-arch reveal"
          />
          {image?.caption && <p className="mt-3 text-sm text-on-dark-muted">{image.caption}</p>}
          {percent !== null && <DiscountBadge percent={percent} className="absolute bottom-5 left-5" />}
        </div>
        <div>
          <p aria-hidden="true" className="font-script text-[2.25rem] leading-none text-honey-300 sm:text-[2.75rem]">
            While it lasts
          </p>
          <Eyebrow tone="dark" decorated="leading" className="mt-4">
            {banner ? "Limited-time deal" : "Limited gift edition"}
          </Eyebrow>
          <h2 id="deal-heading" className="mt-3 font-heading text-h3 font-semibold text-on-dark lg:text-cta">
            {title}
          </h2>
          {description && <p className="mt-4 max-w-md font-subtitle text-on-dark-muted">{description}</p>}
          {product && (
            <Price price={product.price} compareAtPrice={product.compareAtPrice} tone="dark" size="lg" className="mt-6" />
          )}
          {endsAt && endsAtLabel && (
            <div className="mt-8">
              <DealCountdown tone="dark" endsAt={endsAt} endsAtLabel={endsAtLabel} />
            </div>
          )}
          {ctaHref && (
            <ButtonLink href={ctaHref} className="mt-10">
              {ctaLabel}
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  );
}
