import { ArrowDown } from "lucide-react";
import { Breadcrumbs, PageHeroBackground } from "@/components/layout/page-hero";
import { HoneyDivider } from "@/components/motifs/honey-divider";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";
import { foundedYear, sourceRegions } from "./about-content";

/**
 * Brand-story hero: the headline on the left, a "jar label" summing up where
 * the honey comes from on the right. Replaces PageHero but keeps its verse
 * band, id (the header turns transparent over it) and breadcrumb. The H1 is
 * the intended LCP element, so it never animates in.
 */
export function AboutHero() {
  return (
    <>
      <section id="page-hero" aria-labelledby="about-title" className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
        <PageHeroBackground prioritize />
        <div aria-hidden="true" className="about-hero__scrim pointer-events-none absolute inset-0 -z-10 hidden md:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-56 lg:block xl:w-80">
          <HoneycombPattern fade className="text-primary/20" />
        </div>
        <Container className="grid gap-10 pt-[calc(100vw/3+6rem)] pb-14 md:pt-36 md:pb-20 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-44 lg:pb-28">
          <div className="about-hero__copy lg:col-span-7">
            <Breadcrumbs crumbs={[{ label: "About Us" }]} className="mb-6" />
            <h1 id="about-title" className="text-display-sm font-semibold text-balance text-on-dark lg:text-display">
              <span className="mb-3 block text-eyebrow font-bold text-primary uppercase">Our story</span>
              Honey, exactly as the{" "}
              <span className="text-primary">bees</span> made it.
            </h1>
            <p className="mt-5 max-w-[36rem] text-base leading-relaxed text-on-dark-muted lg:text-lg">
              {siteConfig.legalName} works with beekeepers across Pakistan to bring you honey that is raw, tested and
              traceable to the hive it came from.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
              <ButtonLink href="/shop" className="w-full sm:w-auto">
                Shop our honey
              </ButtonLink>
              <a
                href="#story"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm text-sm font-semibold text-on-dark underline underline-offset-4 transition-colors duration-200 hover:text-primary"
              >
                Read how it started
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 lg:justify-self-end">
            <JarLabel />
          </div>
        </Container>
      </section>
      <HoneyDrip size="md" className="relative z-10 -mt-px text-brown-950" />
    </>
  );
}

/** Provenance card styled as a paper jar label. Real data only; the batch line is left blank, as on a label. */
function JarLabel() {
  const rows = [
    { term: "Sourced from", detail: sourceRegions.join(" · ") },
    { term: "Method", detail: "Cold-extracted, cloth-strained" },
    { term: "Checked", detail: "Moisture & adulterants, every batch" },
    { term: "Our shop", detail: siteConfig.contact.shortAddress },
  ];
  return (
    <aside aria-label="At a glance" className="about-label mx-auto w-full max-w-[24rem] text-strong lg:mx-0">
      <div className="about-label__card relative rounded-md bg-ivory px-6 pt-6 pb-5 sm:px-7">
        <div className="text-center">
          <p className="text-eyebrow font-bold text-primary-ink uppercase">
            Raw honey{foundedYear ? ` · since ${foundedYear}` : " · Pakistan"}
          </p>
          <p className="mt-1 text-promo-lg font-bold text-strong">Abdul Sami</p>
          <HoneyDivider className="mx-auto mt-1" />
        </div>
        <dl className="mt-5 divide-y divide-dashed divide-border-strong/40 text-sm">
          {rows.map(({ term, detail }) => (
            <div key={term} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
              <dt className="text-eyebrow leading-5 font-bold text-muted uppercase">{term}</dt>
              <dd className="font-medium text-strong">{detail}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[6.5rem_1fr] items-end gap-3 py-2.5">
            <dt className="text-eyebrow leading-5 font-bold text-muted uppercase">Batch no.</dt>
            <dd className="text-meta text-muted">
              <span aria-hidden="true" className="mb-1 block h-px w-full border-b border-dashed border-strong/50" />
              Printed on every jar
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
