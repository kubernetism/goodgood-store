import type { Metadata } from "next";
import shopDisplay from "../../../../images/header/Abdul Sami Honey Shop Display.png";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/company";
import { getOrderWhatsappNumber } from "@/features/admin/whatsapp-settings-data";
import { getSiteContent, slotImage } from "@/features/content/content-data";
import { SLOT_KEYS } from "@/features/content/slots";
import { schemaDays, toSchemaTime } from "@/features/contact/business-hours";
import { ContactChannels } from "@/features/contact/contact-channels";
import { ContactForm } from "@/features/contact/contact-form";
import { ContactHero } from "@/features/contact/contact-hero";
import { ContactPathways } from "@/features/contact/contact-pathways";
import { formatWhatsappNumber, googleMapsSearchUrl, mapsQuery, whatsappContactLink } from "@/features/contact/contact-routes";
import { siteConfig } from "@/lib/site";
import "@/features/contact/contact.css";

const { contact } = siteConfig;

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Call, WhatsApp, email or visit Abdul Sami Honey Enterprises on Main GT Road, Peshawar. Help with orders, wholesale, gifts and import & export.",
  alternates: { canonical: "/contact" },
};

/** The questions people most often message about, in that order. */
const faqOrder = ["How much is delivery?", "What if my order arrives damaged?", "Why has my honey turned solid?", "How do I know your honey is pure?"];
const contactFaqs = faqOrder.flatMap((question) => faqs.filter((faq) => faq.question === question));

const steps = [
  { title: "Tell us what it's about", text: "Pick a topic so we know what you need." },
  { title: "We read every message", text: "It goes straight to our team in Peshawar." },
  { title: "We reply within one business day", text: "By email, or by phone or WhatsApp if you add your number." },
] as const;

const telephone = (href: string) => href.replace("tel:", "");

function contactStructuredData(shopImageUrl: string) {
  const pageUrl = `${siteConfig.url}/contact`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: `Contact ${contact.businessName}`,
      url: pageUrl,
      mainEntity: {
        "@type": "LocalBusiness",
        name: contact.businessName,
        url: siteConfig.url,
        image: shopImageUrl,
        email: contact.email,
        telephone: telephone(contact.primary.phoneHref),
        address: {
          "@type": "PostalAddress",
          streetAddress: `${contact.branch}, Usman Tower, Shop No. 1, 2, 3, Byco Pump, Main GT Road, Near Nasir Pur Phatak`,
          addressLocality: "Peshawar",
          addressRegion: "Khyber Pakhtunkhwa",
          addressCountry: "PK",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: schemaDays(contact.openingHours),
            opens: toSchemaTime(contact.openingHours.opens),
            closes: toSchemaTime(contact.openingHours.closes),
          },
        ],
        contactPoint: contact.people.map((person) => ({
          "@type": "ContactPoint",
          name: person.name,
          telephone: telephone(person.phoneHref),
          contactType: "customer service",
          areaServed: "PK",
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Contact Us", item: pageUrl },
      ],
    },
  ];
}

export default async function ContactPage() {
  // Both reads are cached ("use cache"), so the page stays in the static
  // shell; the live open/closed status is computed in the browser.
  const [whatsappNumber, content] = await Promise.all([getOrderWhatsappNumber().catch(() => null), getSiteContent()]);
  const whatsappHref = whatsappContactLink(whatsappNumber);
  const whatsappDisplay = whatsappNumber ? formatWhatsappNumber(whatsappNumber) : null;
  const whatsapp = whatsappHref && whatsappDisplay ? { href: whatsappHref, display: whatsappDisplay } : null;
  const shopImage = slotImage(content, SLOT_KEYS.contactMap);
  const mapsUrl = googleMapsSearchUrl(mapsQuery(contact.businessName, contact.shortAddress));
  const call = { href: contact.primary.phoneHref, display: contact.primary.phoneDisplay };

  return (
    <>
      <JsonLd data={contactStructuredData(new URL(shopImage?.url ?? shopDisplay.src, siteConfig.url).toString())} />
      <ContactHero whatsappHref={whatsapp?.href ?? null} />
      <ContactChannels whatsapp={whatsapp} shopImage={shopImage} mapsUrl={mapsUrl} />
      <ContactPathways />

      <section id="message" aria-labelledby="message-heading" className="contact-deferred py-16 [--deferred-height:100rem] md:[--deferred-height:83rem] lg:py-24 lg:[--deferred-height:62rem]">
        <Container className="grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <SectionHeading
              id="message-heading"
              align="left"
              eyebrow="Write to us"
              eyebrowDecoration="leading"
              title="Send us a message"
              description="Prefer writing? Tell us what you need and we'll reply within one business day."
            />
            <ol className="mt-6 space-y-3 lg:mt-8 lg:space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span aria-hidden="true" className="hex-clip flex size-9 shrink-0 items-center justify-center bg-primary-tint font-heading text-sm font-bold text-primary-ink">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-strong">{step.title}</p>
                    <p className="text-meta text-muted lg:text-copy">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-8">
            <ContactForm whatsappHref={whatsapp?.href ?? null} call={call} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="faq-heading" className="contact-deferred bg-cream py-16 [--deferred-height:42rem] md:[--deferred-height:34rem] lg:py-24 lg:[--deferred-height:19rem]">
        <Container className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="faq-heading"
              align="left"
              eyebrow="Good to know"
              eyebrowDecoration="leading"
              title="Quick answers"
              description="Delivery, damaged parcels and crystallised honey: the questions we hear most."
            />
            <p className="mt-6">
              Still need help?{" "}
              <a href={call.href} className="inline-flex min-h-11 items-center font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
                Call {call.display}
              </a>{" "}
              or{" "}
              <a href="#message" className="inline-flex min-h-11 items-center font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
                send us a message
              </a>
              .
            </p>
          </div>
          <div className="rounded-sm bg-surface lg:col-span-8">
            <FaqAccordion items={contactFaqs} />
          </div>
        </Container>
      </section>
    </>
  );
}
