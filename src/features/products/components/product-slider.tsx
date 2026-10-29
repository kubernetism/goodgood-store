import { SlidingRow } from "@/components/ui/sliding-row";
import type { Product } from "../types";
import { ProductCard } from "./product-card";

/** Landing-page product motion; the shop and related-product grids stay static. */
export function ProductSlider({ products, label, className }: {
  products: ReadonlyArray<Product>;
  label: string;
  className?: string;
}) {
  const columns = (maximum: number) => Math.max(1, Math.min(maximum, products.length - 1));
  const imageSizes = `(min-width: 1536px) ${Math.ceil(100 / columns(4))}vw, (min-width: 1024px) ${Math.ceil(100 / columns(3))}vw, (min-width: 640px) ${Math.ceil(100 / columns(2))}vw, 100vw`;
  return (
    <SlidingRow
      label={label}
      fullWidth
      className={className}
      items={products.map((product) => ({ key: product.slug, content: <ProductCard product={product} imageSizes={imageSizes} /> }))}
    />
  );
}
