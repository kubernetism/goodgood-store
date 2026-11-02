import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { categoryIcon } from "../category-icons";
import type { Product } from "../types";

/** Compact product rows for sidebars ("Top Rated Product"). */
export function TopRatedList({ products }: { products: ReadonlyArray<Product> }) {
  return (
    <ul className="divide-y divide-border">
      {products.map((product) => (
        <li key={product.slug} className="group relative flex items-center gap-4 py-4 first:pt-0 last:pb-0">
          <MediaImage
            image={product.images[0]}
            alt=""
            sizes="56px"
            icon={categoryIcon(product.category)}
            iconSize="sm"
            texture={false}
            className="size-14 shrink-0 rounded-md"
          />
          <div className="min-w-0">
            <RatingStars rating={product.rating} />
            <h3 className="mt-0.5 truncate text-sm font-bold text-strong">
              {/* Stretched link: the whole row is clickable. */}
              <Link
                href={`/shop/${product.slug}`}
                className="rounded-sm transition-colors duration-200 group-hover:text-primary-ink after:absolute after:inset-0"
              >
                {product.name}
              </Link>
            </h3>
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          </div>
        </li>
      ))}
    </ul>
  );
}
