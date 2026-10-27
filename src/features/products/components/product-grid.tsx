import type { Product } from "../data";
import { ProductCard } from "./product-card";
import { cx } from "@/lib/cx";

type ProductGridProps = {
  products: ReadonlyArray<Product>;
  /** Desktop column count: 4 on the home page, 3 beside the shop sidebar. */
  columns?: 3 | 4;
  className?: string;
};

/** DS breakpoints: 2 columns on mobile, 3 on tablet, 3–4 on desktop. */
export function ProductGrid({ products, columns = 4, className }: ProductGridProps) {
  return (
    <ul
      className={cx(
        "grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
