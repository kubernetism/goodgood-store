import type { Viewport } from "next";
import { TopBar } from "@/components/layout/top-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollPerformance } from "@/components/layout/scroll-performance";
import "@/features/home/home-theme.css";

export const viewport: Viewport = {
  themeColor: "#e5b45a",
};

/** Home page chrome: brown top bar and the photographic navigation. */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollPerformance />
      <TopBar />
      <SiteHeader className="home-honey-theme" overHomeHero />
      <main id="main" tabIndex={-1} className="home-honey-theme -mt-20 flex-1 bg-surface outline-none">
        {children}
      </main>
      {/* The promises already appear in the trust ledger under the hero. */}
      <SiteFooter showFeatures={false} />
    </>
  );
}
