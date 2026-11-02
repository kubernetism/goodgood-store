import { getCatalog } from "@/features/products/catalog-data";
import { productCardResponse } from "@/features/social-card/card-images";

/**
 * The product's link-preview image. A plain route rather than the
 * opengraph-image convention: that convention's `alt` is one static string, and
 * generateImageMetadata (its only per-product alt) cannot be combined with a
 * generateStaticParams export, which keeps these on the CDN for slow crawlers.
 */
export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.length > 0 ? products.map((product) => ({ slug: product.slug })) : [{ slug: "coming-soon" }];
}

export async function GET(_request: Request, { params }: RouteContext<"/shop/[slug]/card.jpg">) {
  const { slug } = await params;
  return productCardResponse(slug);
}
