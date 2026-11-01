import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategoryCounts } from "@/features/products/catalog";
import { categoryIcon } from "@/features/products/category-icons";
import type { Catalog } from "@/features/products/types";
import { shopHref, defaultShopQuery } from "@/features/products/shop-query";

/**
 * "Shop by variety": numbered, arched specimen tiles, one per category that
 * has products, each linking to the filtered shop. Two per row on phones.
 */
export function VarietyRow({ catalog }: { catalog: Catalog }) {
  const varieties = getCategoryCounts(catalog).filter((variety) => variety.count > 0);
  if (!varieties.length) return null;

  return (
    <section aria-labelledby="varieties-heading" className="overflow-clip bg-tile py-16 lg:py-24">
      <Container>
        <SectionHeading
          id="varieties-heading"
          eyebrow="Shop by type"
          title="Shop by variety"
          description="Every flower gives its honey a different colour, aroma and finish. Start with the one you love."
          className="reveal"
        />
        <ul className="reveal mt-12 flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-6">
          {varieties.map((variety, index) => (
            <li key={variety.slug} className="w-[calc(50%-0.5rem)] sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
              <Link
                href={shopHref(defaultShopQuery, { category: variety.slug })}
                className="home-variety group flex h-full flex-col rounded-md text-center"
              >
                <span className="home-variety__media relative block">
                  <MediaImage
                    image={variety.image}
                    alt=""
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
                    icon={categoryIcon(variety.slug)}
                    iconSize="lg"
                    tone="honey"
                    aspect="aspect-[4/5]"
                    className="home-arch shadow-card"
                  />
                  <span
                    aria-hidden="true"
                    className="home-hex absolute -bottom-5 left-1/2 flex size-11 -translate-x-1/2 items-center justify-center bg-strong font-serif text-sm text-honey-300 italic"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="mt-8 font-heading text-lg leading-tight font-semibold text-strong sm:text-xl">{variety.name}</span>
                {variety.blurb && (
                  <span className="mt-1.5 line-clamp-2 hidden px-2 text-meta text-body sm:block">{variety.blurb}</span>
                )}
                <span className="mt-2 inline-flex items-center justify-center gap-1.5 text-meta font-semibold text-primary-ink">
                  {variety.count} {variety.count === 1 ? "product" : "products"}
                  <ArrowRight className="home-variety__arrow size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
