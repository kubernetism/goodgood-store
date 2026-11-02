import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollPerformance } from "@/components/layout/scroll-performance";
import { WhatsAppFab } from "@/features/contact/whatsapp-fab";

/** Inner-page chrome: dark header that continues into each page's hero band. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollPerformance />
      <SiteHeader overPageHero />
      <main id="main" tabIndex={-1} className="-mt-20 flex-1 pb-24 outline-none lg:pb-30">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFab />
    </>
  );
}
