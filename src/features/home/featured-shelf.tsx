import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { DiscountBadge, Price, SoldOutBadge, discountPercent } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { Eyebrow } from "@/components/ui/section-heading";
import { HoneyDivider } from "@/components/motifs/honey-divider";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { categoryIcon } from "@/features/products/category-icons";
import type { Product } from "@/features/products/types";
import { HoneycombParallax } from "./honeycomb-parallax";

/**
 * "Most loved": the featured jars on a shelf, each with its PKR price and an
 * always-visible Add to cart (no hover-only actions, so it works on touch).
 * Phones scroll the shelf sideways; tablets and up show a grid.
 */
export function FeaturedShelf({ products }: { products: ReadonlyArray<Product> }) {
  return (
    <section aria-labelledby="shelf-heading" className="relative isolate overflow-clip py-16 lg:py-24">
      <HoneycombParallax />
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="reveal">
          <Eyebrow decorated="leading">Most loved</Eyebrow>
          <h2 id="shelf-heading" className="mt-3 text-h2-sm font-semibold lg:text-h2">
            Honey worth <span className="font-script text-[1.3em] leading-none font-normal text-primary-ink">reaching</span> for
          </h2>
          <HoneyDivider className="mt-4" />
        </div>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-sm font-semibold text-strong underline decoration-primary decoration-2 underline-offset-4 transition-colors duration-200 hover:text-primary-ink sm:self-end"
        >
          Shop all honey
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>

      {products.length ? (
        <div className="home-rail mt-10 sm:mx-auto sm:max-w-page sm:px-6">
          <ul
            aria-label="Most loved honey"
            className="scrollbar-none reveal flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-2 pb-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4"
          >
            {products.map((product) => (
              <li key={product.slug} className="w-[74%] max-w-[18rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <ShelfCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Container>
          <p className="mt-10 text-muted">Our honey selection is being updated. Please check back soon.</p>
        </Container>
      )}
    </section>
  );
}

function ShelfCard({ product }: { product: Product }) {
  const href = `/shop/${product.slug}`;
  const percent = discountPercent(product.price, product.compareAtPrice);
  const isSoldOut = product.stock === 0;

  return (
    <article className="home-card relative flex h-full flex-col rounded-lg border border-border bg-surface p-3 shadow-card">
      <div className="home-card__media home-arch relative overflow-hidden">
        <MediaImage
          image={product.images[0]}
          alt=""
          sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 72vw"
          icon={categoryIcon(product.category)}
          iconSize="lg"
          tone="honey"
          aspect="aspect-[4/5]"
        />
        {isSoldOut ? (
          <SoldOutBadge className="absolute bottom-3 left-3" />
        ) : (
          percent !== null && <DiscountBadge percent={percent} className="absolute bottom-3 left-3" />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-1">
        <p className="flex items-center gap-2 font-subtitle text-eyebrow font-bold text-primary-ink uppercase">
          <span aria-hidden="true" className="home-hex inline-block size-2 bg-primary-ink" />
          {product.categoryName}
        </p>
        <h3 className="mt-1.5 font-subtitle text-base leading-snug font-bold text-pretty">
          <Link href={href} className="rounded-sm underline-offset-4 hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
          <span>{product.unit}</span>
          <RatingStars rating={product.rating} />
        </p>
        <div className="mt-auto pt-4">
          <div className="border-t border-dashed border-strong/25 pt-3">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          </div>
          {isSoldOut ? (
            <Link
              href={href}
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-strong text-button font-semibold tracking-[0.06em] text-strong uppercase transition-colors duration-200 hover:bg-strong hover:text-on-dark"
            >
              View details<span className="sr-only">: {product.name}</span>
            </Link>
          ) : (
            <AddToCartButton slug={product.slug} productName={product.name} variant="full" className="mt-3 w-full" />
          )}
        </div>
      </div>
    </article>
  );
}
