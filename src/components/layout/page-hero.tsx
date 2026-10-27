import Link from "next/link";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";

type Crumb = { label: string; href?: string };

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  /** Trail after "Home"; the last crumb is the current page. */
  crumbs: ReadonlyArray<Crumb>;
  /**
   * Detail pages render their own <h1> (product name, post title), so the
   * band's title is demoted to a paragraph there.
   */
  titleAs?: "h1" | "p";
};

/**
 * Brown title band used by every inner page, continuing the dark header. A
 * honeycomb texture builds up on the right where photography would sit.
 */
export function PageHero({
  title,
  eyebrow = "Honey by Abdul Sami",
  crumbs,
  titleAs: Title = "h1",
}: PageHeroProps) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
      <HoneycombPattern fade className="text-primary/15" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-6rem] -z-10 size-[28rem] rounded-full bg-[radial-gradient(circle,rgb(255_184_0/0.22),transparent_65%)]"
      />
      <Container className="flex flex-col gap-6 py-16 md:flex-row md:items-end md:justify-between lg:py-24">
        <div>
          <Eyebrow tone="dark" decorated="leading" className="mb-3">
            {eyebrow}
          </Eyebrow>
          <Title className="font-heading text-display-sm font-semibold text-balance text-on-dark lg:text-display">
            {title}
          </Title>
        </div>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-3 font-display text-sm font-semibold">
            <li>
              <Link href="/" className="rounded-sm text-on-dark transition-colors duration-200 hover:text-primary">
                Home
              </Link>
            </li>
            {crumbs.map((crumb, index) => {
              const isCurrent = index === crumbs.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-on-dark-muted">
                    /
                  </span>
                  {isCurrent || !crumb.href ? (
                    <span aria-current={isCurrent ? "page" : undefined} className="text-primary">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="rounded-sm text-on-dark transition-colors duration-200 hover:text-primary"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </section>
  );
}
