import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HoneyJarIcon } from "@/components/icons/honey-icons";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { buttonClasses } from "@/components/ui/button";
import type { BlogCategorySlug } from "../data";

/** A line of copy per section, so the hand-off to the shop follows from what was just read. */
const pitches: Record<BlogCategorySlug, { title: string; text: string }> = {
  beekeeping: {
    title: "Taste this season's harvest",
    text: "Single-origin honey from our partner beekeepers, spun cold and jarred with its batch number.",
  },
  recipes: {
    title: "Stock the honey for this recipe",
    text: "Acacia for tea, wildflower for baking, Sidr for the table. Raw, never heated or blended.",
  },
  wellness: {
    title: "Raw honey, the way bees made it",
    text: "Never heated, never blended. Crystallisation is how you know it's real.",
  },
  "buying-guide": {
    title: "Honey you can trace",
    text: "Every jar carries its origin, harvest season and batch number. Lab results on request.",
  },
};

/** Honey band that closes every post with one clear path to the shop. */
export function ShopCta({ category }: { category: BlogCategorySlug }) {
  const pitch = pitches[category];
  return (
    <section aria-labelledby="shop-cta-heading">
      <div className="relative isolate overflow-hidden rounded-t-lg bg-primary px-6 pt-10 pb-6 text-strong sm:px-10 lg:px-14 lg:pt-14">
        <HoneycombPattern fade className="text-strong/10" />
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-5">
            <HoneyJarIcon className="hidden size-14 shrink-0 sm:block" strokeWidth={1.25} />
            <div>
              <p className="text-eyebrow font-bold uppercase">From the journal to your jar</p>
              <h2 id="shop-cta-heading" className="mt-2 text-h2-sm font-semibold text-pretty lg:text-h3">
                {pitch.title}
              </h2>
              <p className="mt-2 max-w-xl text-strong">{pitch.text}</p>
            </div>
          </div>
          <Link href="/shop" className={buttonClasses({ variant: "dark", className: "w-full md:w-auto" })}>
            Shop raw honey
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <HoneyDrip size="sm" className="-mt-px text-primary" />
    </section>
  );
}
