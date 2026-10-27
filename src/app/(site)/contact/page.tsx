import type { Metadata } from "next";
import { Check, MailOpen, MapPinned, Map as MapIcon, PhoneCall, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { ContactForm } from "@/features/contact/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Honey by Abdul Sami Enterprises about orders, delivery, bulk and corporate gifting or becoming a partner beekeeper.",
  alternates: { canonical: "/contact" },
};

type ContactCard = {
  icon: LucideIcon;
  title: string;
  lines: ReadonlyArray<{ label: string; href?: string }>;
};

const { contact } = siteConfig;

const cards: ReadonlyArray<ContactCard> = [
  {
    icon: MailOpen,
    title: "Email Address",
    lines: [
      { label: contact.email, href: `mailto:${contact.email}` },
      { label: contact.careersEmail, href: `mailto:${contact.careersEmail}` },
    ],
  },
  {
    icon: PhoneCall,
    title: "Phone Number",
    lines: [
      { label: contact.phoneDisplay, href: contact.phoneHref },
      { label: contact.supportPhoneDisplay, href: contact.supportPhoneHref },
    ],
  },
  {
    icon: MapPinned,
    title: "Our Office",
    lines: [{ label: contact.address }, { label: contact.hours }],
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" crumbs={[{ label: "Contact Us" }]} />

      <section aria-label="Contact details" className="pt-8 pb-16 lg:pb-24">
        <Container>
          <ul className="grid gap-6 md:grid-cols-3">
            {cards.map(({ icon: Icon, title, lines }) => (
              <li key={title} className="flex flex-col items-center rounded-lg border border-border bg-ivory px-6 py-14 text-center lg:py-20">
                <span className="relative">
                  <Icon className="size-14 text-strong" strokeWidth={1.1} aria-hidden="true" />
                  <span className="absolute -top-1 -right-3 flex size-6 items-center justify-center rounded-full bg-primary">
                    <Check className="size-3.5 text-strong" strokeWidth={3} aria-hidden="true" />
                  </span>
                </span>
                <h2 className="mt-5 text-h4 font-semibold">{title}</h2>
                <ul className="mt-3 text-base text-strong">
                  {lines.map((line) => (
                    <li key={line.label}>
                      {line.href ? (
                        <a href={line.href} className="transition-colors duration-200 hover:text-primary-ink">
                          {line.label}
                        </a>
                      ) : (
                        line.label
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="quote-heading">
        <Container>
          {/* The form card overlaps the top of the map, as in the mockup. */}
          <div className="relative z-10 bg-surface px-0 sm:px-6 lg:mx-auto lg:max-w-[48.75rem] lg:px-5">
            <h2 id="quote-heading" className="text-promo font-semibold">
              Send Us a Message
            </h2>
            <p className="mt-2 mb-8">Tell us what you need and our team will reply within one business day.</p>
            <ContactForm />
            <div className="h-8" />
          </div>
        </Container>
        <div className="-mt-24 lg:-mt-40">
          <ImagePlaceholder
            label={`Map showing our store at ${contact.address} (map coming soon)`}
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
