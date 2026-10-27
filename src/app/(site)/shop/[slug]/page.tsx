import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CalendarDays, Flower2, Gift, Info, MapPin, Scale, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SocialIcon } from "@/components/icons/social-icons";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Container } from "@/components/ui/container";
import { PaymentBadges } from "@/components/ui/payment-badges";
import { Price, discountPercent } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeading, Eyebrow } from "@/components/ui/section-heading";
import { SidebarPanel } from "@/components/ui/sidebar-panel";
import {
  getAllProducts,
  getCategory,
  getProductBySlug,
  getRelatedProducts,
  getTopRatedProducts,
} from "@/features/products/catalog";
import { categoryHighlights, type Product } from "@/features/products/data";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { ProductGrid } from "@/features/products/components/product-grid";
import { QuantityAddToCart } from "@/features/products/components/quantity-add-to-cart";
import { TopRatedList } from "@/features/products/components/top-rated-list";
import { shopHref, defaultShopQuery } from "@/features/products/shop-query";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart/pricing";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: product.name, description: product.summary, type: "website" },
  };
}

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <>
      <PageHero
        title="Product Details"
        titleAs="p"
        eyebrow="Raw, traceable, in season"
        crumbs={[{ label: "Shop", href: "/shop" }, { label: "Product Details" }]}
      />
      {/* Params are awaited inside Suspense so unknown slugs still get an
          instant App Shell (ISR with Cache Components). */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/shop/[slug]">, "params">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const shareUrl = encodeURIComponent(`${siteConfig.url}/shop/${product.slug}`);
  const shareLinks = [
    { network: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { network: "x", label: "X (Twitter)", href: `https://x.com/intent/post?url=${shareUrl}` },
  ] as const;

  return (
    <>
      <Container className="py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="grid gap-8 md:grid-cols-2 md:gap-8">
              <ProductGallery
                productName={product.name}
                category={product.category}
                discount={discountPercent(product.price, product.compareAtPrice)}
              />

              <div className="space-y-5">
                <Link
                  href={shopHref(defaultShopQuery, { category: product.category })}
                  className="inline-block rounded-sm font-display text-eyebrow font-semibold text-primary-ink uppercase hover:underline"
                >
                  {category.name} honey
                </Link>
                <h1 className="font-heading text-h3 font-semibold lg:text-[2.5rem] lg:leading-tight">{product.name}</h1>
                <p className="flex items-center gap-3 text-meta">
                  <RatingStars rating={product.rating} size="md" />
                  <span>({product.reviewCount} reviews)</span>
                </p>
                <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
                <p>{product.summary}</p>

                <ul aria-label="Product qualities" className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={shopHref(defaultShopQuery, { tag })}
                        className="inline-flex min-h-8 items-center rounded-full border border-border bg-ivory px-3 font-display text-meta font-medium text-strong transition-colors duration-200 hover:border-strong hover:bg-primary-tint"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>

                <QuantityAddToCart slug={product.slug} productName={product.name} />

                <p className="text-meta">
                  Free delivery across Pakistan on orders over{" "}
                  <strong className="text-strong">{formatPrice(FREE_SHIPPING_THRESHOLD)}</strong>.
                </p>

                <div className="flex items-center gap-3 border-y border-border py-3">
                  <span className="text-sm font-semibold text-strong">Share:</span>
                  <ul className="flex gap-1">
                    {shareLinks.map((link) => (
                      <li key={link.network}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-11 items-center justify-center rounded-full text-strong transition-colors duration-200 hover:bg-primary-tint"
                        >
                          <SocialIcon network={link.network} className="size-5" />
                          <span className="sr-only">Share on {link.label} (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-3 font-display text-sm font-semibold text-strong">Safe, simple checkout</p>
                  <PaymentBadges />
                </div>
              </div>
            </div>

            <HoneyProfile product={product} />
            <ProductDescription product={product} />
          </div>

          <aside aria-label="More honey" className="space-y-8 lg:col-span-4">
            <SidebarPanel title="Top Rated">
              <TopRatedList products={getTopRatedProducts(5)} />
            </SidebarPanel>
            <GiftPromoCard />
          </aside>
        </div>
      </Container>

      <section aria-labelledby="related-heading" className="bg-ivory py-16 lg:py-24">
        <Container>
          <SectionHeading id="related-heading" eyebrow="Keep exploring" title="You may also like" />
          <ProductGrid products={getRelatedProducts(product, 4)} className="mt-10" />
        </Container>
      </section>
    </>
  );
}

/** Origin, harvest, floral source, weight and taste: the facts honey buyers ask for first. */
function HoneyProfile({ product }: { product: Product }) {
  const facts = [
    { icon: MapPin, term: "Origin", value: product.origin },
    { icon: CalendarDays, term: "Harvest", value: product.harvest },
    { icon: Flower2, term: "Floral source", value: product.floralSource },
    { icon: Scale, term: "Net weight", value: product.unit },
    { icon: Sparkles, term: "Taste notes", value: product.tasteNotes },
  ] as const;

  return (
    <section aria-labelledby="profile-heading" className="mt-16">
      <h2 id="profile-heading" className="font-heading text-promo font-semibold">
        Honey profile
      </h2>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {facts.map(({ icon: Icon, term, value }) => (
          <div key={term} className="flex items-start gap-4 rounded-md border border-border bg-ivory p-4 last:sm:col-span-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-strong">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <dt className="font-display text-meta font-semibold text-muted">{term}</dt>
              <dd className="font-display text-sm font-semibold text-strong">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ProductDescription({ product }: { product: Product }) {
  return (
    <section aria-labelledby="description-heading" className="mt-16">
      <h2 id="description-heading" className="font-heading text-promo font-semibold">
        About this honey
      </h2>
      <div className="mt-6 space-y-4 text-strong">
        <p>{product.description}</p>
        <p className="font-semibold">Why you&apos;ll love it:</p>
        <ul className="list-disc space-y-1 pl-6 marker:text-primary-ink">
          {categoryHighlights[product.category].map((item) => (
            <li key={item.title}>
              <strong>{item.title}:</strong> {item.text}
            </li>
          ))}
        </ul>
        <p className="flex gap-3 rounded-md border-l-4 border-primary bg-primary-tint p-4 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
          <span>
            <strong>Good to know:</strong> raw honey can crystallise in cool weather. It is a natural sign that it
            has not been heated. Stand the closed jar in warm water to make it runny again.
          </span>
        </p>
      </div>
    </section>
  );
}

function GiftPromoCard() {
  return (
    <div className="on-dark relative isolate overflow-hidden rounded-lg bg-brown-950 p-6 text-on-dark">
      <HoneycombPattern fade className="text-primary/15" />
      <Gift aria-hidden="true" strokeWidth={1} className="absolute top-1/2 right-4 -z-10 size-28 -translate-y-1/2 text-primary/40" />
      <div className="relative max-w-[65%]">
        <Eyebrow tone="dark">Gift sets</Eyebrow>
        <p className="mt-2 font-heading text-h3 leading-tight font-semibold">Give something golden</p>
        <p className="mt-1 text-sm text-on-dark-muted">Boxed jars, comb and dippers for Eid and weddings.</p>
        <Link
          href={shopHref(defaultShopQuery, { category: "gift-sets" })}
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Shop gift sets <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <Container className="py-16 lg:py-24" aria-busy="true" aria-label="Loading product">
      <div className="grid gap-6 md:grid-cols-2 lg:w-2/3">
        <div className="aspect-[4/5] animate-pulse rounded-lg bg-tile" />
        <div className="space-y-4">
          <div className="h-5 w-32 animate-pulse rounded-sm bg-tile" />
          <div className="h-7 w-2/3 animate-pulse rounded-sm bg-tile" />
          <div className="h-12 w-1/2 animate-pulse rounded-sm bg-tile" />
          <div className="h-24 animate-pulse rounded-sm bg-tile" />
        </div>
      </div>
    </Container>
  );
}
