import { ArrowRight, Gift } from "lucide-react";
import { BeeIcon, HoneyJarIcon, type IconComponent } from "@/components/icons/honey-icons";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cx } from "@/lib/cx";
import { topicAnchorId } from "./contact-topics";
import type { ContactService } from "./validation";

const pathways: ReadonlyArray<{ service: ContactService; icon: IconComponent; title: string; text: string; cta: string }> = [
  {
    service: "bulk-orders",
    icon: HoneyJarIcon,
    title: "Wholesale & bulk honey",
    text: "For shops, restaurants, distributors and export buyers. Tell us the variety, quantity and destination.",
    cta: "Ask for a quote",
  },
  {
    service: "gift-boxes",
    icon: Gift,
    title: "Corporate & wedding gifts",
    text: "Gifts for staff, clients, weddings and Eid, packed with your own note.",
    cta: "Plan a gift order",
  },
  {
    service: "farm-partnership",
    icon: BeeIcon,
    title: "Become a partner beekeeper",
    text: "Keep bees in Pakistan? Tell us about your apiary and the honey you harvest.",
    cta: "Introduce your apiary",
  },
];

/**
 * Business doors into the form. Each card links to its topic's radio
 * (`#enquiry-…`): without JS the browser jumps there; with JS the form picks
 * the topic and focuses it (see ContactForm).
 */
export function ContactPathways() {
  return (
    <section aria-labelledby="pathways-heading" className="contact-deferred on-dark [--deferred-height:52rem] md:[--deferred-height:34rem] lg:[--deferred-height:30rem] relative isolate overflow-hidden bg-brown-950 py-14 lg:py-20">
      <HoneycombPattern fade className="text-primary/10" />
      <Container>
        <SectionHeading
          id="pathways-heading"
          tone="dark"
          align="left"
          eyebrow="Import & Export · Wholesale"
          eyebrowDecoration="leading"
          title="Planning something bigger?"
          description="Buying for a shop, an event or another country? Tell us what you have in mind and we'll take it from there."
        />
        <ul className="reveal mt-8 grid gap-4 md:grid-cols-3 md:gap-6 lg:mt-10">
          {pathways.map(({ service, icon: Icon, title, text, cta }) => (
            <li
              key={service}
              className={cx(
                "group relative flex items-start gap-4 rounded-lg border border-on-dark/10 bg-brown-900 p-5 md:flex-col md:gap-0 md:p-6",
                "transition-[transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-brown-800 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              )}
            >
              <span aria-hidden="true" className="hex-clip flex size-11 shrink-0 items-center justify-center bg-primary text-strong">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1 md:mt-4 md:flex md:flex-1 md:flex-col">
                <h3 className="text-h4 font-semibold text-on-dark">
                  <a
                    href={`#${topicAnchorId(service)}`}
                    className="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-focus"
                  >
                    {title}
                    <span className="sr-only">: {cta}</span>
                  </a>
                </h3>
                <p className="mt-1 text-on-dark-muted">{text}</p>
                <p aria-hidden="true" className="mt-5 hidden items-center gap-2 text-sm font-semibold text-primary md:mt-auto md:inline-flex md:pt-5">
                  {cta}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                </p>
              </div>
              <ArrowRight aria-hidden="true" className="mt-3 size-5 shrink-0 text-primary md:hidden" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
