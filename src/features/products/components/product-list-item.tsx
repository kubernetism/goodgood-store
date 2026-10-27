import Link from "next/link";
import { Eye } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { DiscountBadge, Price, discountPercent } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { getCategory } from "../catalog";
import { categoryIcons } from "../category-icons";
import type { Product } from "../data";

/** Shop list-view row: image left; variety, name, weight, price, summary and actions right. */
export function ProductListItem({ product }: { product: Product }) {
  const percent = discountPercent(product.price, product.compareAtPrice);
  const href = `/shop/${product.slug}`;

  return (
    <article className="group grid overflow-hidden rounded-lg border border-border bg-surface transition-shadow duration-200 hover:shadow-card-hover sm:grid-cols-[12.5rem_1fr]">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          icon={categoryIcons[product.category]}
          iconSize="lg"
          aspect="aspect-[4/3] sm:aspect-auto sm:h-full"
          className="transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {percent !== null && <DiscountBadge percent={percent} className="absolute top-3 left-3" />}
      </div>
      <div className="flex flex-col gap-1.5 p-5">
        <p className="font-display text-eyebrow font-semibold text-primary-ink uppercase">
          {getCategory(product.category).name} · {product.unit}
        </p>
        <h3 className="font-display text-h4 font-semibold">
          <Link href={href} className="rounded-sm transition-colors duration-200 hover:text-primary-ink">
            {product.name}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          <RatingStars rating={product.rating} />
        </div>
        <p className="line-clamp-2 text-body">{product.summary}</p>
        <div className="mt-3 flex gap-3">
          <AddToCartButton slug={product.slug} productName={product.name} />
          <Link
            href={href}
            className="flex size-11 items-center justify-center rounded-full bg-surface text-strong shadow-card transition-colors duration-200 hover:bg-primary"
          >
            <Eye className="size-5" aria-hidden="true" />
            <span className="sr-only">View {product.name} details</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
