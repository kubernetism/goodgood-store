import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
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
import { getCategory, getProductBySlug, getProductsByCategory, getTopRatedProducts } from "@/features/products/catalog";
import { ProductGrid } from "@/features/products/components/product-grid";
import type { CategorySlug } from "@/features/products/data";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.legalName} | ${siteConfig.titleTagline}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const tabCategories: ReadonlyArray<CategorySlug> = [
  "sidr",
  "acacia",
  "wildflower",
  "black-forest",
  "pure-natural",
  "honeycomb",
  "gift-sets",
];

const DEAL_PRODUCT_SLUG = "honeycomb-gift-box";
const DEAL_ENDS_AT = "2026-12-31";

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <PromiseCards />

      <VarietyRow />

      <section aria-labelledby="our-honey-heading" className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            id="our-honey-heading"
            eyebrow="From the hive"
            title="Our honey"
            description="Every jar is raw, traceable and harvested in season. Choose a variety to explore."
            className="reveal"
          />
          <div className="mt-10">
            <ProductTabs
              label="Honey varieties"
              tabs={tabCategories.map((slug) => ({
                id: slug,
                label: getCategory(slug).name,
                panel: <ProductGrid products={getProductsByCategory(slug, 4)} />,
              }))}
            />
          </div>
        </Container>
      </section>

      <DealBanner />

      <section aria-labelledby="favourites-heading" className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            id="favourites-heading"
            eyebrow="Best rated"
            title="Customer favourites"
            className="reveal"
          />
          <ProductGrid products={getTopRatedProducts(8)} className="mt-10" />
        </Container>
      </section>

      {/* The still straddles the white → cream boundary into testimonials. */}
      <section
        aria-labelledby="story-heading"
        className="bg-linear-to-b from-surface from-60% to-cream to-60% pt-4"
      >
        <Container>
          <SectionHeading
            id="story-heading"
            eyebrow="Our story"
            title="From hive to jar"
            description="Meet the beekeepers of Karak and Swat who move their hives with the bloom, and see how each jar is filled by hand."
            className="reveal"
          />
          <div className="mt-10">
            <VideoBlock />
          </div>
        </Container>
      </section>

      <Testimonials />

      <LatestBlog />
    </>
  );
}

function DealBanner() {
  const product = getProductBySlug(DEAL_PRODUCT_SLUG);
  if (!product) return null;
  const percent = discountPercent(product.price, product.compareAtPrice);

  return (
    <section aria-labelledby="deal-heading" className="on-dark relative isolate overflow-hidden bg-brown-950 py-16 lg:py-24">
      <HoneycombPattern fade className="text-primary/10" />
      <Container className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <div className="relative">
          <ImagePlaceholder
            icon={Gift}
            iconSize="xl"
            tone="dark"
            rounded="lg"
            aspect="aspect-[5/4]"
            caption="Gift box photo coming soon"
            className="reveal"
          />
          {percent !== null && <DiscountBadge percent={percent} className="absolute top-5 left-5" />}
        </div>
        <div>
          <Eyebrow tone="dark" decorated="leading">
            Limited gift edition
          </Eyebrow>
          <h2 id="deal-heading" className="mt-4 font-heading text-h3 font-semibold text-on-dark lg:text-cta">
            The Honeycomb Gift Box
          </h2>
          <p className="mt-4 max-w-md text-on-dark-muted">{product.summary}</p>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} tone="dark" size="lg" className="mt-6" />
          <div className="mt-8">
            <DealCountdown
              tone="dark"
              endsAt={`${DEAL_ENDS_AT}T23:59:59Z`}
              endsAtLabel={`on ${formatDate(DEAL_ENDS_AT)}`}
            />
          </div>
          <ButtonLink href={`/shop/${product.slug}`} className="mt-10">
            Shop the gift box
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
