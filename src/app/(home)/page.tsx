import type { Metadata } from "next";
import Image from "next/image";
import { Gift } from "lucide-react";
import { HoneycombParallax } from "@/features/home/honeycomb-parallax";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { DiscountBadge, Price, discountPercent } from "@/components/ui/price";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { LatestBlog } from "@/components/sections/latest-blog";
import { Testimonials } from "@/components/sections/testimonials";
import { DealCountdown } from "@/features/home/deal-countdown";
import { HomeHero } from "@/features/home/home-hero";
import { ProductTabs } from "@/features/home/product-tabs";
import { PromiseCards } from "@/features/home/promise-cards";
import { VarietyRow } from "@/features/home/variety-row";
import { VideoBlock } from "@/features/home/video-block";
import { getActiveBanners } from "@/features/banners/banner-data";
import type { StorefrontBanner } from "@/features/banners/model";
import { SLOT_KEYS } from "@/features/content/slots";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { getProductBySlug, getProductsByCategory, getTopRatedProducts } from "@/features/products/catalog";
import { getCatalog } from "@/features/products/catalog-data";
import { ProductSlider } from "@/features/products/components/product-slider";
import type { Catalog, ImageAsset } from "@/features/products/types";
import { formatDate } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { parseYouTubeUrl } from "@/lib/youtube";
import { siteConfig } from "@/lib/site";
import { localImages } from "@/content/local-images";
import { JsonLd } from "@/components/seo/json-ld";
import brandLogo from "../../../images/logo/abdulSamiEnterprisesLogo.png";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.legalName} | ${siteConfig.titleTagline}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/** Shown when no deal banner is live (the original static promotion). */
const FALLBACK_DEAL_PRODUCT_SLUG = "honeycomb-gift-box";
const FALLBACK_DEAL_ENDS_AT = "2026-12-31";

export default async function HomePage() {
  // All three reads are cached (tags: catalog, banners, content), so the page
  // prerenders into the static shell and refreshes when the admin edits.
  const [catalog, banners, content] = await Promise.all([getCatalog(), getActiveBanners(), getSiteContent()]);
  const story = content[SLOT_KEYS.homeStory];
  const storyVideo = story?.youtubeId ? parseYouTubeUrl(story.youtubeId) : null;
  // Categories with products, in the admin's order.
  const tabCategories = catalog.categories.filter((category) => getProductsByCategory(catalog, category.slug, 1).length > 0);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: siteConfig.contact.businessName,
        url: siteConfig.url,
        image: new URL(brandLogo.src, siteConfig.url).toString(),
        logo: new URL(brandLogo.src, siteConfig.url).toString(),
        telephone: siteConfig.contact.primary.phoneHref.replace("tel:", ""),
        email: siteConfig.contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Branch No. 2, Usman Tower, Shop No. 1, 2, 3, Byco Pump, Main GT Road, Near Nasir Pur Phatak",
          addressLocality: "Peshawar",
          addressCountry: "PK",
        },
      }} />
      <HomeHero banner={banners.hero} slotImage={slotImage(content, SLOT_KEYS.homeHero)} />

      <PromiseCards />

      <VarietyRow catalog={catalog} />

      <section aria-labelledby="our-honey-heading" className="relative isolate py-16 lg:py-24">
        <HoneycombParallax />
        <Container>
          <SectionHeading
            id="our-honey-heading"
            eyebrow="From the hive"
            title="Our honey"
            description={tabCategories.length ? "Every jar is raw, traceable and harvested in season. Choose a variety to explore." : undefined}
            className="reveal"
          />
        </Container>
        <div className="mt-10">
          {tabCategories.length ? <ProductTabs
            label="Honey varieties"
            tabs={tabCategories.map((category) => ({
              id: category.slug,
              label: category.name,
              panel: <ProductSlider products={getProductsByCategory(catalog, category.slug, 4)} label={`${category.name} honey`} />,
            }))}
          /> : <Container><p className="text-center text-muted">Our honey selection is being updated. Please check back soon.</p></Container>}
        </div>
      </section>

      <DealBanner catalog={catalog} banner={banners.deal} fallbackImage={slotImage(content, SLOT_KEYS.homeDeal)} />

      {catalog.products.length > 1 && <section aria-labelledby="favourites-heading" className="relative isolate py-16 lg:py-24">
        <HoneycombParallax />
        <Container>
          <SectionHeading
            id="favourites-heading"
            eyebrow="Best rated"
            title="Customer favourites"
            className="reveal"
          />
        </Container>
        <ProductSlider products={getTopRatedProducts(catalog, 8)} label="Customer favourites" className="mt-10" />
      </section>}

      {/* The still straddles the white → cream boundary into testimonials. */}
      <section
        aria-labelledby="story-heading"
        className="relative isolate bg-linear-to-b from-surface from-60% to-cream to-60% pt-4"
      >
        <HoneycombParallax />
        <Container>
          <SectionHeading
            id="story-heading"
            eyebrow="Our story"
            title={storyVideo ? "From hive to jar" : "From our shelves to your table"}
            description={storyVideo
              ? "Meet the beekeepers of Karak and Swat who move their hives with the bloom, and see how each jar is filled by hand."
              : "Explore our honey, honey-soaked nuts and saffron. Contact our Peshawar team for product and import or export enquiries."}
            className="reveal"
          />
          <div className="mt-10">
            {storyVideo ? (
              <VideoBlock
                poster={slotImage(content, SLOT_KEYS.homeStory)}
                video={storyVideo}
                title="Our beekeeping story: from hive to jar"
              />
            ) : (
              <div className="reveal">
                <Image
                  src={slotImage(content, SLOT_KEYS.homeStory)?.url ?? localImages.showcase.url}
                  alt={slotImage(content, SLOT_KEYS.homeStory)?.alt ?? localImages.showcase.alt}
                  width={slotImage(content, SLOT_KEYS.homeStory)?.width ?? localImages.showcase.width!}
                  height={slotImage(content, SLOT_KEYS.homeStory)?.height ?? localImages.showcase.height!}
                  sizes="(min-width: 1200px) 1170px, 100vw"
                  className="h-auto w-full rounded-lg"
                />
                <div className="mt-6 text-center">
                  <ButtonLink href="/contact" variant="dark">Enquire about our range</ButtonLink>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      <Testimonials background={<HoneycombParallax />} />

      <LatestBlog autoSlide background={<HoneycombParallax />} />
    </>
  );
}

type DealBannerProps = {
  catalog: Catalog;
  banner: StorefrontBanner | null;
  /** "home.deal" slot image, used when the deal has no image of its own. */
  fallbackImage: ImageAsset | null;
};

function DealBanner({ catalog, banner, fallbackImage }: DealBannerProps) {
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
    <section aria-labelledby="deal-heading" className="on-dark relative isolate overflow-hidden bg-brown-950 py-16 lg:py-24">
      <HoneycombParallax tone="dark" />
      <Container className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <div className="relative">
          <MediaImage
            image={image}
            sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
            icon={Gift}
            iconSize="xl"
            tone="dark"
            rounded="lg"
            aspect="aspect-[5/4]"
            caption="Gift box photo coming soon"
            className="reveal"
          />
          {image?.caption && <p className="mt-3 text-sm text-on-dark-muted">{image.caption}</p>}
          {percent !== null && <DiscountBadge percent={percent} className="absolute top-5 left-5" />}
        </div>
        <div>
          <Eyebrow tone="dark" decorated="leading">
            {banner ? "Limited-time deal" : "Limited gift edition"}
          </Eyebrow>
          <h2 id="deal-heading" className="mt-4 font-heading text-h3 font-semibold text-on-dark lg:text-cta">
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
