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

type SiteHeaderProps = {
  /** Optional route-scoped palette; doesn't wrap or constrain the sticky header. */
  className?: string;
  /** Fade the background away when the navbar overlaps the home hero. */
  overHomeHero?: boolean;
};

export function SiteHeader({ className, overHomeHero = false }: SiteHeaderProps) {
  return (
    <HeaderFrame
      className={className}
      overHomeHero={overHomeHero}
      background={
        <>
          <Image src={navbarBackground} alt="" fill sizes="100vw" loading="eager" className="object-cover object-center" />
          <span data-navbar-overlay className="absolute inset-0" style={{ backgroundColor: "rgb(27 17 8 / 90%)" }} />
        </>
      }
    >
      <Container className="flex h-20 items-center gap-4">
        <Logo tone="dark" compact className="shrink-0" />

        <div className="hidden flex-1 justify-center lg:flex">
          {/* usePathname suspends on routes whose params are unknown at build
              time, so the prerendered shell shows the nav without highlighting. */}
          <Suspense fallback={<MainNav tone="dark" activePath={null} />}>
            <ActiveMainNav tone="dark" />
          </Suspense>
        </div>

        <div className="on-light ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <HeaderSearch />
          <CartLink />
          <MobileNav />
        </div>
      </Container>
    </HeaderFrame>
  );
}
