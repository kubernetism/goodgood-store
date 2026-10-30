import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { localImages } from "@/content/local-images";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { siteConfig } from "@/lib/site";
import { getCatalog } from "@/features/products/catalog-data";
import { getCategoryCounts } from "@/features/products/catalog";
import { FeaturesStrip } from "./features-strip";
import { SocialLinks } from "./social-links";
import { FooterDisclosure } from "./footer-disclosure";

const otherLinkColumns = [
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

/**
 * `showFeatures`: the promises strip above the footer. The home page passes false
 * because it already shows the promises as drip cards under the hero.
 * Preserve the approved design (variance 4, motion 1, density 5): tighter
 * spacing, a horizontal desktop contact row, native disclosures on mobile.
 */
export async function SiteFooter({ showFeatures = true }: { showFeatures?: boolean }) {
  const catalog = await getCatalog();
  const linkColumns = [
    {
      title: "Shop",
      links: [
        { label: "All Honey", href: "/shop" },
        ...getCategoryCounts(catalog).filter((category) => category.count > 0).map((category) => ({
          label: category.name,
          href: `/shop?category=${encodeURIComponent(category.slug)}`,
        })),
      ],
    },
    ...otherLinkColumns,
  ];
  return (
    <>
      {showFeatures && <FeaturesStrip />}
      <footer className="on-dark relative isolate bg-brown-950 text-on-dark">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <Image src={localImages.footer.url} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: "center top" }} />
          <span data-footer-overlay className="absolute inset-0" style={{ backgroundColor: "rgb(27 17 8 / 90%)" }} />
        </div>
        <div className="relative mx-auto w-full max-w-wide px-4 pt-8 pb-5 sm:px-6 lg:pt-10 lg:pb-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-3">
              <Logo tone="dark" className="[&_img]:size-11" />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-on-dark-muted">{siteConfig.tagline}</p>
              <SocialLinks className="mt-1 -ml-3 text-on-dark [&_a:hover]:text-honey-300" />
            </div>

            <div className="lg:col-span-6">
              <div className="hidden gap-5 lg:grid lg:grid-cols-3">
                {linkColumns.map((column) => (
                  <nav key={column.title} aria-label={column.title}>
                    <h2 className="font-subtitle text-sm font-bold text-on-dark">{column.title}</h2>
                    <FooterLinks links={column.links} />
                  </nav>
                ))}
              </div>
              <div className="lg:hidden">
                {linkColumns.map((column) => (
                  <FooterDisclosure key={column.title} title={column.title}>
                    <nav aria-label={column.title} className="pb-3">
                      <FooterLinks links={column.links} />
                    </nav>
                  </FooterDisclosure>
                ))}
                <FooterDisclosure title="Contact & hours">
                  <div className="pt-3 pb-4"><FooterContactDetails /></div>
                </FooterDisclosure>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-3">
              <h2 className="font-subtitle text-sm font-bold text-on-dark">The Hive Letter</h2>
              <p className="mt-2 mb-3 text-sm leading-relaxed text-on-dark-muted">
                Harvest news, limited releases and honey recipes, about once a month.
              </p>
              <NewsletterForm tone="dark" />
              <p className="flex flex-wrap items-center gap-2 text-meta text-on-dark-muted">
                We accept
                <span className="rounded-sm bg-surface px-3 py-1.5 font-semibold text-strong">Cash on Delivery</span>
              </p>
            </div>
          </div>
          <div className="mt-5 hidden border-t border-on-dark/15 pt-4 lg:block">
            <FooterContactDetails />
          </div>
        </div>

        <div className="border-t border-on-dark/15 text-on-dark-muted">
          <div className="mx-auto flex w-full max-w-wide flex-col gap-1 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {siteConfig.copyrightYear} {siteConfig.legalName}. All rights reserved.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-4 font-display font-semibold">
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

function FooterLinks({ links }: { links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <ul className="mt-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-on-dark-muted transition-colors duration-200 hover:text-honey-300 lg:min-h-9">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterContactDetails() {
  return (
    <div className="grid gap-4 text-meta leading-relaxed lg:grid-cols-[1fr_1.5fr_1fr] lg:gap-6">
      <address className="flex items-start gap-2 text-on-dark-muted not-italic">
        <MapPin className="mt-1 size-4 shrink-0 text-honey-300" aria-hidden="true" />
        <span>
          <span className="font-semibold text-on-dark">{siteConfig.contact.branch}. </span>
          {siteConfig.contact.address}
        </span>
      </address>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-3">
        {siteConfig.contact.people.map((person) => (
          <li key={person.phoneHref}>
            <a href={person.phoneHref} className="inline-flex min-h-11 items-center gap-2 text-on-dark transition-colors duration-200 hover:text-honey-300">
              <Phone className="size-3.5 shrink-0 text-honey-300" aria-hidden="true" />
              <span>
                <span className="block font-semibold">{person.name}</span>
                <span className="whitespace-nowrap">{person.phoneDisplay}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="min-w-0 text-on-dark-muted">
        <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex min-h-11 max-w-full items-center gap-2 text-on-dark transition-colors duration-200 hover:text-honey-300 lg:-mt-2">
          <Mail className="size-4 shrink-0 text-honey-300" aria-hidden="true" />
          <span className="min-w-0 break-all">{siteConfig.contact.email}</span>
        </a>
        <p><span className="sr-only">Support hours: </span>{siteConfig.contact.hours}</p>
        <p>{siteConfig.contact.onlineOrders}</p>
      </div>
    </div>
  );
}
