import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategoryCounts } from "@/features/products/catalog";
import { categoryIcons } from "@/features/products/category-icons";
import { shopHref, defaultShopQuery } from "@/features/products/shop-query";

/** "Shop by variety": arched tiles per category, scrolling sideways on small screens. */
export function VarietyRow() {
  const varieties = getCategoryCounts();

  return (
    <section aria-labelledby="varieties-heading" className="bg-ivory py-16 lg:py-24">
      <Container>
        <SectionHeading
          id="varieties-heading"
          eyebrow="Explore the range"
          title="Shop by variety"
          className="reveal"
        />
      </Container>
      <ul className="scrollbar-none mx-auto mt-10 flex max-w-page snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:grid lg:grid-cols-7 lg:gap-5 lg:overflow-visible">
        {varieties.map((variety) => (
          <li key={variety.slug} className="w-36 shrink-0 snap-start sm:w-40 lg:w-auto">
            <Link
              href={shopHref(defaultShopQuery, { category: variety.slug })}
              className="group flex flex-col items-center rounded-md text-center"
            >
              <ImagePlaceholder
                icon={categoryIcons[variety.slug]}
                iconSize="md"
                tone="honey"
                aspect="aspect-[4/5]"
                className="w-full rounded-t-full rounded-b-md transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
              />
              <span className="mt-4 font-heading text-lg font-semibold text-strong">{variety.name}</span>
              <span className="text-meta text-muted">
                {variety.count} {variety.count === 1 ? "product" : "products"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
