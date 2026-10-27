import Link from "next/link";
import { Eye } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { DiscountBadge, Price, discountPercent } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { getCategory } from "../catalog";
import { categoryIcons } from "../category-icons";
import type { Product } from "../data";

type ProductCardProps = {
  product: Product;
  /** Heading level for the product name, to keep the page outline valid. */
  headingLevel?: "h3" | "h2";
};

/**
 * Product card: warm photo tile with discount badge, then variety, name,
 * weight, stars and price. Hover lifts the card and reveals quick actions;
 * on touch they stay visible.
 */
export function ProductCard({ product, headingLevel: Heading = "h3" }: ProductCardProps) {
  const percent = discountPercent(product.price, product.compareAtPrice);
  const href = `/shop/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow duration-200 hover:shadow-card-hover">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          icon={categoryIcons[product.category]}
          iconSize="lg"
          className="transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {percent !== null && <DiscountBadge percent={percent} className="absolute top-3 left-3" />}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 transition duration-200 pointer-fine:translate-y-2 pointer-fine:opacity-0 pointer-fine:group-focus-within:translate-y-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:translate-y-0 pointer-fine:group-hover:opacity-100">
          <AddToCartButton slug={product.slug} productName={product.name} />
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="relative z-10 flex size-11 items-center justify-center rounded-full bg-surface text-strong shadow-card transition-colors duration-200 hover:bg-primary"
          >
            <Eye className="size-5" />
          </Link>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 pt-4 pb-5">
        <p className="font-display text-eyebrow font-semibold text-primary-ink uppercase">
          {getCategory(product.category).name}
        </p>
        <Heading className="font-sans text-sm leading-snug font-semibold text-strong sm:text-base">
          <Link href={href} className="rounded-sm transition-colors duration-200 group-hover:text-primary-ink">
            {product.name}
          </Link>
        </Heading>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
          <span>{product.unit}</span>
          <RatingStars rating={product.rating} />
        </p>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="mt-auto pt-2" />
      </div>
    </article>
  );
}
