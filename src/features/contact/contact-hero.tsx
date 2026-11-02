import { ArrowDown, Mail, PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { Breadcrumbs, PageHeroBackground } from "@/components/layout/page-hero";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";
import { OfficePill, OfficeSign } from "./office-status";

const { contact } = siteConfig;

/**
 * "Signboard" hero: who you're contacting, whether anyone is in right now,
 * and one tap to a person above the fold. Replaces PageHero on this page
 * but keeps its verse band, id (the header turns transparent over it) and
 * breadcrumb. The H1 is the intended LCP element, so it never animates in.
 */
export function ContactHero({ whatsappHref }: { whatsappHref: string | null }) {
  const call = contact.primary;
  return (
    <>
      <section id="page-hero" aria-labelledby="contact-title" className="on-dark relative isolate overflow-hidden bg-brown-950 text-on-dark">
        <PageHeroBackground prioritize />
        <div aria-hidden="true" className="contact-hero__scrim pointer-events-none absolute inset-0 -z-10 hidden md:block" />
        {/* Gold lattice at the right edge, echoing the shop's honeycomb wall. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-48 lg:block xl:w-72">
          <HoneycombPattern fade className="text-primary/25" />
        </div>
        <Container className="grid gap-8 pt-[calc(100vw/3+6rem)] pb-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:pt-36 md:pb-20 lg:grid-cols-12 lg:pt-44 lg:pb-24">
          <div className="contact-hero__copy lg:col-span-7">
            <Breadcrumbs crumbs={[{ label: "Contact Us" }]} className="mb-6" />
            <h1 id="contact-title" className="text-display-sm font-semibold text-balance text-on-dark lg:text-display">
              <span className="mb-3 block text-eyebrow font-bold text-primary uppercase">Contact us</span>
              Let&apos;s talk <span className="text-primary">honey</span>.
            </h1>
            <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-on-dark-muted lg:text-lg">
              Questions about an order, wholesale or a gift? Call, WhatsApp or visit our shop on {contact.shortAddress}.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses({ className: "w-full sm:w-auto" })}>
                  <WhatsAppIcon className="size-5" />
                  Chat on WhatsApp
                  <span className="sr-only"> (opens WhatsApp)</span>
                </a>
              ) : null}
              <a
                href={call.phoneHref}
                className={buttonClasses({ variant: whatsappHref ? "outline-dark" : "primary", className: "w-full sm:w-auto" })}
              >
                <PhoneCall className="size-4" aria-hidden="true" />
                Call {call.phoneDisplay}
              </a>
              {!whatsappHref && (
                <a href={`mailto:${contact.email}`} className={buttonClasses({ variant: "outline-dark", className: "w-full sm:w-auto" })}>
                  <Mail className="size-4" aria-hidden="true" />
                  Email us
                </a>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="#message"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-on-dark underline underline-offset-4 transition-colors duration-200 hover:text-primary"
              >
                Or send us a message
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <OfficePill hours={contact.openingHours} className="md:hidden" />
            </div>
            <p className="mt-5 hidden text-meta text-on-dark-muted sm:block">
              {contact.onlineOrders} · Cash on delivery across Pakistan
            </p>
          </div>

          <div className="hidden justify-self-end md:block lg:col-span-5 lg:self-center">
            <OfficeSign hours={contact.openingHours} />
          </div>
        </Container>
      </section>
      <HoneyDrip size="md" className="relative z-10 -mt-px text-brown-950" />
    </>
  );
}
