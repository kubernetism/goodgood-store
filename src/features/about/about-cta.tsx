import { MapPin, PhoneCall } from "lucide-react";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { siteConfig } from "@/lib/site";

const { contact } = siteConfig;

/** Closing brown band: shop or get in touch, plus The Hive Letter sign-up (source "about"). */
export function AboutCta() {
  return (
    <section aria-labelledby="about-cta-heading" className="on-dark relative isolate overflow-hidden bg-brown-950 py-16 text-on-dark lg:py-24">
      <HoneycombPattern fade className="text-primary/15" />
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-7">
          <p aria-hidden="true" className="font-script text-[2.5rem] leading-none text-primary sm:text-[3rem]">
            Taste the season
          </p>
          <h2 id="about-cta-heading" className="mt-3 text-h2-sm font-semibold text-on-dark lg:text-cta">
            Find the honey that&apos;s right for your table
          </h2>
          <p className="mt-4 max-w-xl font-subtitle text-base text-on-dark-muted">
            Browse the shop, or ask us anything: which variety to choose, gifting in bulk, or import and export.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/shop" className="w-full sm:w-auto">
              Shop all honey
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline-dark" className="w-full sm:w-auto">
              Contact us
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-col gap-3 text-sm text-on-dark-muted sm:flex-row sm:flex-wrap sm:gap-x-8">
            <li>
              <a
                href={contact.primary.phoneHref}
                className="inline-flex min-h-6 items-center gap-2 rounded-sm font-semibold text-on-dark transition-colors duration-200 hover:text-primary"
              >
                <PhoneCall className="size-4 text-primary" aria-hidden="true" />
                {contact.primary.phoneDisplay}
                <span className="sr-only"> (call {contact.primary.name})</span>
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {contact.shortAddress}
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-on-dark/15 bg-on-dark/5 p-6 sm:p-8 lg:col-span-5">
          <h3 className="text-h4 font-semibold text-on-dark lg:text-xl">Join The Hive Letter</h3>
          <p className="mt-2 text-sm text-on-dark-muted">Harvest news, limited releases and honey recipes, about once a month.</p>
          <div className="about-newsletter mt-5">
            <NewsletterForm variant="wide" tone="dark" source="about" />
          </div>
        </div>
      </Container>
    </section>
  );
}
