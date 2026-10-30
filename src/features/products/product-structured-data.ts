import type { Product } from "./types";
import { siteConfig } from "@/lib/site";

export function productStructuredData(product: Product) {
  const url = `${siteConfig.url}/shop/${product.slug}`;
  // Range illustrations are not accurate pack shots; only mark up actual product photos.
  const images = product.images.filter((image) => !image.caption).map((image) => new URL(image.url, siteConfig.url).toString());
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    ...(images.length ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}
