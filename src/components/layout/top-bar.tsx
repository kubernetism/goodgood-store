import { Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart/pricing";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { SocialLinks } from "./social-links";

/** Home-only utility band above the header: brown, cream text. Hidden under 640px. */
export function TopBar() {
  return (
    <div className="on-dark hidden bg-brown-950 text-meta text-on-dark sm:block">
      <Container className="flex h-10 items-center justify-between gap-6">
        <ul className="flex items-center gap-6">
          <li>
            <a
              href={siteConfig.contact.phoneHref}
              className="flex items-center gap-2 transition-colors duration-200 hover:text-primary"
            >
              <Phone className="size-3.5 text-primary" aria-hidden="true" />
              {siteConfig.contact.phoneDisplay}
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
        <p className="hidden text-on-dark-muted lg:block">
          Free delivery across Pakistan on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </p>
        <SocialLinks className="-mr-3" iconClassName="size-3.5" />
      </Container>
    </div>
  );
}
