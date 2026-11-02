import type { Metadata } from "next";
import { brandCardImage } from "@/features/social-card/card-model";
import { siteConfig } from "@/lib/site";

/**
 * The root layout's Open Graph tags. Pages that set no openGraph inherit them,
 * and Next.js fills in their title and description. A page that does set
 * openGraph replaces this object rather than merging, so it spreads it first.
 */
export const baseOpenGraph = {
  siteName: siteConfig.legalName,
  locale: "en_PK",
  type: "website",
  images: [brandCardImage],
} satisfies NonNullable<Metadata["openGraph"]>;
