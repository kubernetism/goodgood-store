import Link from "next/link";
import { Mail, Megaphone, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { getActiveBanners } from "@/features/banners/banner-data";
import type { StorefrontBanner } from "@/features/banners/model";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart/pricing";
import { getSiteSocialLinks } from "@/features/settings/social-links-data";
import { formatPrice } from "@/lib/format";
import { cx } from "@/lib/cx";
import { siteConfig } from "@/lib/site";
import { SocialLinks } from "./social-links";

/**
 * Home-only utility band above the header: brown, cream text. The contact
 * row is hidden under 640px; an announcement banner from the admin replaces
 * the free-delivery line and also shows on phones as a slim centred bar.
 * The social links (Admin > Settings) sit at the right from 640px and get
 * their own compact centred row on phones, so they are always at the top.
 */
export async function TopBar() {
  const [{ announcement }, socials] = await Promise.all([getActiveBanners(), getSiteSocialLinks()]);
  const socialClassName = "[&_a:hover]:text-primary";

  return (
    <div className="on-dark bg-brown-950 text-meta text-on-dark">
      {announcement && (
        <p className="flex min-h-10 items-center justify-center px-4 py-2 text-center sm:hidden">
          <Announcement banner={announcement} />
        </p>
      )}
      {socials.length > 0 && (
        <div className={cx("flex items-center justify-center gap-2 px-4 sm:hidden", announcement && "border-t border-on-dark/10")}>
          <span className="text-on-dark-muted">Follow us</span>
          <SocialLinks networks={socials} className={socialClassName} iconClassName="size-4" />
        </div>
      )}
      <Container className="hidden h-10 items-center justify-between gap-6 sm:flex">
        <ul className="flex items-center gap-6">
          <li>
            <a
              href={siteConfig.contact.primary.phoneHref}
              aria-label={`Call ${siteConfig.contact.primary.name} at ${siteConfig.contact.primary.phoneDisplay}`}
              className="flex items-center gap-2 transition-colors duration-200 hover:text-primary"
            >
              <Phone className="size-3.5 text-primary" aria-hidden="true" />
              {siteConfig.contact.primary.phoneDisplay}
            </a>
          </li>
          <li className="hidden md:block">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-2 transition-colors duration-200 hover:text-primary"
            >
              <Mail className="size-3.5 text-primary" aria-hidden="true" />
              {siteConfig.contact.email}
            </a>
          </li>
        </ul>
        {announcement ? (
          <p className="hidden min-w-0 truncate md:block">
            <Announcement banner={announcement} />
          </p>
        ) : (
          <p className="hidden text-on-dark-muted lg:block">
            Free delivery across Pakistan on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}
        <SocialLinks networks={socials} className={cx("-mr-3", socialClassName)} iconClassName="size-3.5" />
      </Container>
    </div>
  );
}

function Announcement({ banner }: { banner: StorefrontBanner }) {
  return (
    <>
      <Megaphone className="mr-2 inline size-3.5 align-[-0.15em] text-primary" aria-hidden="true" />
      <span className="font-semibold">{banner.title}</span>
      {banner.subtitle && <span className="text-on-dark-muted"> {banner.subtitle}</span>}
      {banner.ctaLabel && banner.ctaHref && (
        <>
          {" "}
          <Link href={banner.ctaHref} className="font-semibold text-primary underline underline-offset-2 hover:no-underline">
            {banner.ctaLabel}
          </Link>
        </>
      )}
    </>
  );
}
