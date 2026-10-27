import { TopBar } from "@/components/layout/top-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/** Home page chrome: brown top bar + honey header that blends into the hero. */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <SiteHeader tone="honey" />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      {/* The promises already appear as drip cards under the hero. */}
      <SiteFooter showFeatures={false} />
    </>
  );
}
