import { Breadcrumbs, PageHeroBackground } from "@/components/layout/page-hero";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { Container } from "@/components/ui/container";

/**
 * Masthead for the journal index. Replaces PageHero on this page but keeps
 * its verse band, id (the header turns transparent over it) and breadcrumb.
 * Static, so it prerenders while the filtered list streams in below.
 */
export function JournalHero() {
  return (
    <>
      <section id="page-hero" aria-labelledby="journal-title" className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
        <PageHeroBackground prioritize />
        <div aria-hidden="true" className="journal-hero__scrim pointer-events-none absolute inset-0 -z-10 hidden md:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-48 lg:block xl:w-72">
          <HoneycombPattern fade className="text-primary/25" />
        </div>
        <Container className="pt-[calc(100vw/3+6rem)] pb-12 md:pt-36 md:pb-20 lg:pt-44 lg:pb-24">
          <div className="journal-hero__copy max-w-3xl">
            <Breadcrumbs crumbs={[{ label: "Journal" }]} className="mb-6" />
            <h1 id="journal-title" className="text-display-sm font-semibold text-balance text-on-dark lg:text-display">
              <span className="mb-3 block text-eyebrow font-bold text-primary uppercase">Stories from the hive</span>
              The Honey <span className="text-primary">Journal</span>
            </h1>
            <p className="journal-standfirst mt-5 max-w-xl text-lg text-on-dark-muted lg:text-xl">
              Field notes from Pakistan&apos;s beekeepers, recipes from our kitchen, and honest guides to buying real honey.
            </p>
          </div>
        </Container>
      </section>
      <HoneyDrip size="md" className="relative z-10 -mt-px text-brown-950" />
    </>
  );
}
