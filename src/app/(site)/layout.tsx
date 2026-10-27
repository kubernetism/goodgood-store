import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/** Inner-page chrome: dark header that continues into each page's hero band. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader tone="dark" />
      <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none lg:pb-30">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
