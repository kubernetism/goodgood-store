import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/features/blog/blog-data";
import { getCatalog } from "@/features/products/catalog-data";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/shop", "/blog", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${siteConfig.url}${path}`,
  }));

  const catalog = await getCatalog();
  const productRoutes = catalog.products.map((product) => ({
    url: `${siteConfig.url}/shop/${product.slug}`,
  }));

  const categoryRoutes = catalog.categories.filter((category) => catalog.products.some((product) => product.category === category.slug)).map((category) => ({
    url: `${siteConfig.url}/shop?category=${encodeURIComponent(category.slug)}`,
  }));

  const postRoutes = (await getPublishedBlogPosts()).map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
