import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Google must be able to crawl cart and checkout to read their noindex tags.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
