import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";
import { cx } from "@/lib/cx";
import { ActiveMainNav, MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { HeaderSearch } from "./header-search";
import { CartLink } from "./cart-link";

type SiteHeaderProps = {
  /** `honey` blends into the home hero; `dark` continues into the brown page-hero band. */
  tone: "honey" | "dark";
};

export function SiteHeader({ tone }: SiteHeaderProps) {
  return (
    <header className={cx("sticky top-0 z-40", tone === "dark" ? "on-dark bg-brown-950" : "bg-honey-300")}>
      <Container className="flex h-20 items-center gap-4">
        <Logo tone={tone === "dark" ? "dark" : "light"} className="shrink-0" />

        <div className="hidden flex-1 justify-center lg:flex">
          {/* usePathname suspends on routes whose params are unknown at build
              time, so the prerendered shell shows the nav without highlighting. */}
          <Suspense fallback={<MainNav tone={tone} activePath={null} />}>
            <ActiveMainNav tone={tone} />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <HeaderSearch />
          <CartLink />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
