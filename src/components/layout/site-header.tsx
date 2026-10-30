import { Suspense } from "react";
import Image from "next/image";
import navbarBackground from "../../../images/middle_of_website_images/navbar_background_image.png";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";
import { ActiveMainNav, MainNav } from "./main-nav";
import { HeaderFrame } from "./header-frame";
import { MobileNav } from "./mobile-nav";
import { HeaderSearch } from "./header-search";
import { CartLink } from "./cart-link";
import { getCatalog } from "@/features/products/catalog-data";
import { catalogNavigation } from "@/features/products/catalog-navigation";

type SiteHeaderProps = {
  /** Optional route-scoped palette; doesn't wrap or constrain the sticky header. */
  className?: string;
  /** Fade the background away when the navbar overlaps the home hero. */
  overHomeHero?: boolean;
  /** Fade the background away when the navbar overlaps an inner-page hero. */
  overPageHero?: boolean;
};

export async function SiteHeader({ className, overHomeHero = false, overPageHero = false }: SiteHeaderProps) {
  const catalog = await getCatalog();
  const navigation = catalogNavigation(catalog);
  return (
    <HeaderFrame
      className={className}
      heroId={overHomeHero ? "home-hero" : overPageHero ? "page-hero" : undefined}
      background={
        <>
          <Image src={navbarBackground} alt="" fill sizes="100vw" loading="eager" className="object-cover object-[center_42%]" />
          <span data-navbar-overlay className="absolute inset-0" style={{ backgroundColor: "rgb(27 17 8 / 90%)" }} />
        </>
      }
    >
      <Container className="flex h-20 items-center gap-4">
        <Logo tone="dark" compact className="shrink-0" />

        <div className="hidden flex-1 justify-center lg:flex">
          {/* usePathname suspends on routes whose params are unknown at build
              time, so the prerendered shell shows the nav without highlighting. */}
          <Suspense fallback={<MainNav tone="dark" activePath={null} items={navigation} />}>
            <ActiveMainNav tone="dark" items={navigation} />
          </Suspense>
        </div>

        <div className="on-light ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <HeaderSearch />
          <CartLink availableSlugs={catalog.products.map((product) => product.slug)} />
          <MobileNav items={navigation} />
        </div>
      </Container>
    </HeaderFrame>
  );
}
