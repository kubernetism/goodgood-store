import type { Metadata } from "next";
import { Clock, Mail, MapPinned, Map as MapIcon, PhoneCall } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { SLOT_KEYS } from "@/features/content/slots";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { ContactForm } from "@/features/contact/contact-form";
import { siteConfig } from "@/lib/site";

const { contact } = siteConfig;

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${contact.businessName} for honey orders, import and export enquiries. Visit ${contact.branch} at ${contact.address}`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await getSiteContent();
  return (
    <>
      <PageHero title="Contact Us" crumbs={[{ label: "Contact Us" }]} />

      <section aria-labelledby="contact-business-heading" className="pt-8 pb-16 lg:pb-24">
        <Container>
          <div className="mb-8 text-center">
            <h2 id="contact-business-heading" className="text-h2-sm font-semibold lg:text-h2">
              {contact.businessName}
            </h2>
            <p className="mt-2 font-subtitle text-lg text-primary-ink">{contact.businessType}</p>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {contact.people.map((person) => (
              <li key={person.phoneHref} className="flex flex-col items-center rounded-lg border border-border bg-ivory px-6 py-8 text-center lg:py-10">
                <PhoneCall className="size-10 text-strong" strokeWidth={1.1} aria-hidden="true" />
                <h3 className="mt-5 text-h4 font-semibold">{person.name}</h3>
                <a
                  href={person.phoneHref}
                  aria-label={`Call ${person.name} at ${person.phoneDisplay}`}
                  className="mt-1 inline-flex min-h-11 items-center text-base text-strong transition-colors duration-200 hover:text-primary-ink"
                >
                  {person.phoneDisplay}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-lg border border-border bg-ivory p-6 sm:p-8">
              <MapPinned className="mt-1 size-7 shrink-0 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3 className="text-h4 font-semibold">Business Address</h3>
                <address className="mt-2 text-base text-strong not-italic">
                  <span className="block font-semibold">{contact.branch}</span>
                  {contact.address}
                </address>
              </div>
            </div>
            <div className="space-y-5 rounded-lg border border-border bg-ivory p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 size-6 shrink-0 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
                <div className="min-w-0">
                  <h3 className="text-h4 font-semibold">Support Email</h3>
                  <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center break-all text-sm text-strong hover:text-primary-ink sm:text-base">
                    {contact.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="mt-1 size-6 shrink-0 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h3 className="text-h4 font-semibold">Support Hours</h3>
                  <p className="mt-2 text-strong">{contact.hours}</p>
                  <p className="mt-1 font-semibold text-primary-ink">{contact.onlineOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="quote-heading">
        <Container>
          {/* The form card overlaps the top of the map, as in the mockup. */}
          <div className="relative z-10 bg-surface px-0 sm:px-6 lg:mx-auto lg:max-w-[48.75rem] lg:px-5">
            <h2 id="quote-heading" className="text-promo font-semibold">
              Send Us a Message
            </h2>
            <p className="mt-2 mb-8 font-subtitle">Tell us what you need and our team will reply within one business day.</p>
            <ContactForm />
            <div className="h-8" />
          </div>
        </Container>
        <div className="-mt-24 lg:-mt-40">
          <MediaImage
            image={slotImage(content, SLOT_KEYS.contactMap)}
            sizes="100vw"
            label={`Map showing our store at ${contact.branch}, ${contact.address} (map coming soon)`}
            icon={MapIcon}
            iconSize="lg"
            tone="honey"
            aspect="aspect-[4/3] sm:aspect-[16/7] lg:aspect-[16/6]"
            caption="Map"
          />
        </div>
      </section>
    </>
  );
}
