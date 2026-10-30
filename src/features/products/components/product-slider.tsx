import { SlidingRow } from "@/components/ui/sliding-row";
import { cx } from "@/lib/cx";
import type { Product } from "../types";
import { ProductCard } from "./product-card";

/** Landing-page product motion; the shop and related-product grids stay static. */
export function ProductSlider({ products, label, className }: {
  products: ReadonlyArray<Product>;
  label: string;
  className?: string;
}) {
  if (!products.length) return null;

  // A small selection should read like product cards, not an oversized carousel.
  if (products.length <= 2) {
    const imageSizes = products.length === 1
      ? "(min-width: 432px) 400px, calc(100vw - 32px)"
      : "(min-width: 872px) 400px, calc((100vw - 48px) / 2)";
    return <div className={cx("mx-auto w-full px-4 sm:px-6", className)}>
      <ul aria-label={label} className={cx("mx-auto grid gap-4 sm:gap-6", products.length === 1 ? "max-w-[25rem] grid-cols-1" : "max-w-[51.5rem] grid-cols-2")}>
        {products.map((product) => <li key={product.slug}><ProductCard product={product} imageSizes={imageSizes} /></li>)}
      </ul>
    </div>;
  }

  const fullWidth = products.length > 4;
  const columns = (maximum: number) => Math.max(1, Math.min(maximum, products.length - 1));
  const imageSizes = fullWidth
    ? `(min-width: 1536px) ${Math.ceil(100 / columns(4))}vw, (min-width: 1024px) ${Math.ceil(100 / columns(3))}vw, (min-width: 640px) ${Math.ceil(100 / columns(2))}vw, 100vw`
    : "(min-width: 432px) 400px, 100vw";
  return (
    <SlidingRow
      label={label}
      fullWidth={fullWidth}
      className={className}
      items={products.map((product) => ({ key: product.slug, content: <ProductCard product={product} imageSizes={imageSizes} /> }))}
    />
  );
}
