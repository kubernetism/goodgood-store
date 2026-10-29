import type { Metadata } from "next";
import { HoneyJarIcon } from "@/components/icons/honey-icons";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none lg:pb-30">
        <section className="on-dark bg-brown-950 py-20 text-center text-on-dark lg:py-28">
          <Container>
            <HoneyJarIcon className="mx-auto size-14 text-primary" strokeWidth={1.25} />
            <p className="mt-4 font-display text-eyebrow font-semibold text-primary">Error 404</p>
            <h1 className="mt-2 text-display-sm font-semibold text-on-dark lg:text-display">Page not found</h1>
            <p className="mx-auto mt-4 max-w-md text-on-dark-muted">
              This page may have moved, or the link might be mistyped. Let&apos;s get you back to something sweeter.
            </p>
          </Container>
        </section>
        <Container className="flex flex-wrap justify-center gap-4 pt-12">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/shop" variant="outline">
            Browse the shop
          </ButtonLink>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
