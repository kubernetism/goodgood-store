import type { MetadataRoute } from "next";
import { blogPosts } from "@/features/blog/data";
import { getAllProducts } from "@/features/products/catalog";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/shop", "/blog", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${siteConfig.url}${path}`,
  }));

  const productRoutes = getAllProducts().map((product) => ({
    url: `${siteConfig.url}/shop/${product.slug}`,
    lastModified: product.listedOn,
  }));

  const postRoutes = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.publishedOn,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
