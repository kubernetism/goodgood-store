import Link from "next/link";
import { Banknote } from "lucide-react";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { Container } from "@/components/ui/container";
import { cx } from "@/lib/cx";

/**
 * Compact brown band for the checkout funnel (replaces the tall PageHero so
 * the first field is above the fold on phones). The id makes the sticky site
 * header go transparent over it, exactly as over a PageHero; pt-20 clears it.
 */
export function CheckoutHeader({ step }: { step: "details" | "done" }) {
  const stepClass = (current: boolean) => cx(current ? "text-primary" : "text-on-dark-muted");
  return (
    <>
      <section id="page-hero" className="on-dark bg-brown-950 pt-20 text-on-dark">
        <Container className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-6 pb-2 md:pt-8 md:pb-3">
          <div>
            <ol aria-label="Checkout progress" className="flex flex-wrap items-center gap-2 text-meta font-semibold">
              <li>
                <Link href="/cart" className="-my-3 inline-flex min-h-11 items-center rounded-sm text-on-dark-muted underline-offset-2 transition-colors duration-200 hover:text-primary hover:underline">
                  Basket
                </Link>
              </li>
              <li aria-hidden="true" className="text-on-dark-muted">›</li>
              <li aria-current={step === "details" ? "step" : undefined} className={stepClass(step === "details")}>Details</li>
              <li aria-hidden="true" className="text-on-dark-muted">›</li>
              <li aria-current={step === "done" ? "step" : undefined} className={stepClass(step === "done")}>Done</li>
            </ol>
            <h1 className="mt-1 font-heading text-h2-sm font-semibold text-on-dark md:text-h3">Checkout</h1>
          </div>
          <p className="flex items-center gap-2 text-meta text-on-dark-muted">
            <Banknote className="size-4 text-primary" aria-hidden="true" />
            Cash on delivery · No card needed
          </p>
        </Container>
      </section>
      <HoneyDrip size="sm" className="-mt-px text-brown-950" />
    </>
  );
}
