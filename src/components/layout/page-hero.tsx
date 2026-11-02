import Link from "next/link";
import Image from "next/image";
import navbarBackground from "../../../images/middle_of_website_images/navbar_background_image.png";
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
 * Brown title band used by every inner page, continuing the dark header.
 * The image retains its proportions so both lines of the verse stay in frame.
 */
export function PageHeroBackground({ prioritize = false }: { prioritize?: boolean } = {}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* With `prioritize`, the 40px-blurred wash loads as a tiny thumbnail
          (it looks identical, and is too low-detail to count as the LCP) and
          the sharp verse is fetched eagerly at high priority. No <link
          rel=preload>: that competed with the CSS on slow phones. */}
      <Image
        src={navbarBackground}
        alt=""
        fill
        sizes={prioritize ? "48px" : "100vw"}
        className="scale-110 object-cover object-center opacity-25 blur-2xl"
      />
      <div className="mt-20 flex h-full items-start justify-center md:mt-0 md:items-center">
        <Image
          src={navbarBackground}
          alt=""
          sizes="100vw"
          loading={prioritize ? "eager" : undefined}
          fetchPriority={prioritize ? "high" : undefined}
          className="h-auto w-full md:h-full md:w-auto md:max-w-full md:object-contain"
          style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}
        />
      </div>
      <span className="absolute inset-0 bg-[rgb(27_17_8/80%)]" />
    </div>
  );
}

export function PageHero({
  title,
  eyebrow = "Honey by Abdul Sami",
  crumbs,
  titleAs: Title = "h1",
}: PageHeroProps) {
  return (
    <section id="page-hero" className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
      <PageHeroBackground />
      <Container className="flex flex-col gap-6 pt-[calc(100vw/3+6rem)] pb-10 md:flex-row md:items-end md:justify-between md:pt-36 md:pb-16 lg:pt-44 lg:pb-24">
        <div>
          <Eyebrow tone="dark" decorated="leading" className="mb-3">
            {eyebrow}
          </Eyebrow>
          <Title className="text-display-sm font-semibold text-balance text-on-dark lg:text-display">
            {title}
          </Title>
        </div>
        <Breadcrumbs crumbs={crumbs} />
      </Container>
    </section>
  );
}

/** "Home / …" trail for brown hero bands; the last crumb is the current page. */
export function Breadcrumbs({ crumbs, className }: { crumbs: ReadonlyArray<Crumb>; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-3 text-sm font-semibold">
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
  );
}
