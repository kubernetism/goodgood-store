import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { HoneycombPattern } from "@/components/motifs/honeycomb-pattern";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { siteConfig } from "@/lib/site";
import { FeaturesStrip } from "./features-strip";
import { SocialLinks } from "./social-links";

const linkColumns = [
  {
    title: "Shop",
    links: [
      { label: "All Honey", href: "/shop" },
      { label: "Sidr Honey", href: "/shop?category=sidr" },
      { label: "Acacia Honey", href: "/shop?category=acacia" },
      { label: "Honeycomb", href: "/shop?category=honeycomb" },
      { label: "Gift Sets", href: "/shop?category=gift-sets" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Journal", href: "/blog" },
      { label: "Best Sellers", href: "/shop?tag=Best+Seller" },
      { label: "FAQ", href: "/about#faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Delivery Information", href: "/terms#delivery" },
      { label: "Returns & Refunds", href: "/terms#returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Your Cart", href: "/cart" },
    ],
  },
] as const;

// Placeholder list until the Pakistani payment providers are confirmed.
const paymentMethods = ["Cash on Delivery", "Visa", "Mastercard", "Bank Transfer"] as const;

/**
 * `showFeatures`: the overlapping promises strip. The home page passes false
 * because it already shows the promises as drip cards under the hero.
 */
export function SiteFooter({ showFeatures = true }: { showFeatures?: boolean }) {
  return (
    <>
      {showFeatures && <FeaturesStrip />}
      <footer className={showFeatures ? "bg-cream pt-15" : "bg-cream"}>
        <div className="relative isolate">
          <HoneycombPattern fade className="text-primary-ink/[0.06]" />
          <div className="mx-auto grid w-full max-w-wide gap-10 px-4 pt-16 pb-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:pt-20">
            <div className="lg:col-span-4 xl:col-span-3">
              <Logo />
              <p className="mt-5 max-w-sm text-body">{siteConfig.tagline}</p>
              <address className="mt-5 space-y-3 text-strong not-italic">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-1 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
                  {siteConfig.contact.address}
                </p>
                <p>
                  <a
                    href={siteConfig.contact.phoneHref}
                    className="inline-flex items-center gap-3 transition-colors duration-200 hover:text-primary-ink"
                  >
                    <Phone className="size-4 shrink-0 text-primary-ink" aria-hidden="true" />
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="inline-flex items-center gap-3 break-all transition-colors duration-200 hover:text-primary-ink"
                  >
                    <Mail className="size-4 shrink-0 text-primary-ink" aria-hidden="true" />
                    {siteConfig.contact.email}
                  </a>
                </p>
              </address>
              <SocialLinks className="mt-3 -ml-3 text-strong" />
            </div>

            {linkColumns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="lg:col-span-2">
                <h2 className="font-display text-base font-semibold">{column.title}</h2>
                <ul className="mt-5 space-y-1">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-strong transition-colors duration-200 hover:text-primary-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3">
              <h2 className="font-display text-base font-semibold">The Hive Letter</h2>
              <p className="mt-5 mb-5 text-strong">
                Harvest news, limited releases and honey recipes, about once a month.
              </p>
              <NewsletterForm />
              <h3 className="mt-3 font-display text-meta font-semibold">We accept</h3>
              <ul
                aria-label="Accepted payment methods"
                className="mt-3 flex w-fit flex-wrap items-center gap-x-4 gap-y-2 rounded-sm bg-surface px-4 py-2.5"
              >
                {paymentMethods.map((method) => (
                  <li key={method} className="font-display text-meta font-semibold text-strong">
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="on-dark bg-brown-950 text-on-dark">
          <div className="mx-auto flex w-full max-w-wide flex-col gap-3 px-4 py-4 text-meta sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {siteConfig.copyrightYear} {siteConfig.legalName}. All rights reserved.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-6 gap-y-1 font-display font-semibold">
                <li>
                  <Link href="/terms" className="inline-flex min-h-10 items-center hover:text-primary">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/terms#claims" className="inline-flex min-h-10 items-center hover:text-primary">
                    Claims
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
