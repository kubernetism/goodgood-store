import { Banknote, PhoneCall } from "lucide-react";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { siteConfig } from "@/lib/site";

const { contact } = siteConfig;

/** Brown sign-up band for The Hive Letter (source "home"), with the COD and phone lines beside it. */
export function HomeNewsletter() {
  return (
    <section aria-labelledby="newsletter-heading" className="on-dark relative isolate overflow-clip bg-brown-950 py-16 text-on-dark lg:py-20">
      <HoneycombPattern fade className="text-honey-300/15" />
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="reveal lg:col-span-6">
          <p aria-hidden="true" className="text-kicker text-honey-300">
            The Hive Letter
          </p>
          <h2 id="newsletter-heading" className="mt-3 text-h2-sm font-semibold text-on-dark lg:text-h2">
            First to hear when the harvest lands
          </h2>
          <p className="mt-4 max-w-lg text-base text-on-dark-muted">
            Harvest news, limited releases and honey recipes, about once a month.
          </p>
        </div>
        <div className="reveal lg:col-span-6">
          <div className="home-newsletter rounded-lg border border-on-dark/15 bg-on-dark/5 p-5 sm:p-7">
            <NewsletterForm variant="wide" tone="dark" source="home" />
          </div>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-on-dark-muted sm:flex-row sm:flex-wrap sm:gap-x-8">
            <li className="inline-flex items-center gap-2">
              <Banknote className="size-4 shrink-0 text-honey-300" aria-hidden="true" />
              Cash on delivery: pay the courier when your honey arrives
            </li>
            <li>
              <a
                href={contact.primary.phoneHref}
                className="inline-flex min-h-6 items-center gap-2 rounded-sm font-semibold text-on-dark transition-colors duration-200 hover:text-honey-300"
              >
                <PhoneCall className="size-4 text-honey-300" aria-hidden="true" />
                Questions? {contact.primary.phoneDisplay}
                <span className="sr-only"> (call {contact.primary.name})</span>
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
