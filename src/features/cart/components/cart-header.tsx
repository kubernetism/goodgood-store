import { Banknote } from "lucide-react";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { Container } from "@/components/ui/container";

/**
 * Compact brown band that opens the checkout funnel (Basket › Details › Done),
 * matching the checkout header so the two pages read as one flow. It replaces
 * the tall PageHero so the first line item sits above the fold on phones.
 * id="page-hero" lets the sticky site header go transparent over it; pt-20 clears it.
 */
export function CartHeader() {
  return (
    <>
      <section id="page-hero" className="on-dark relative isolate overflow-hidden bg-brown-950 pt-20 text-on-dark">
        <span aria-hidden="true" className="mask-honeycomb-fade absolute inset-0 -z-10 text-primary/10" />
        <Container className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-6 pb-2 md:pt-10 md:pb-4">
          <div>
            <ol aria-label="Checkout progress" className="flex flex-wrap items-center gap-2 text-meta font-semibold">
              <li aria-current="step" className="text-primary">Basket</li>
              <li aria-hidden="true" className="text-on-dark-muted">›</li>
              <li className="text-on-dark-muted">Details</li>
              <li aria-hidden="true" className="text-on-dark-muted">›</li>
              <li className="text-on-dark-muted">Done</li>
            </ol>
            <p className="mt-3 font-script text-promo-lg leading-none text-primary">Almost yours</p>
            <h1 className="mt-1 font-heading text-h2-sm font-semibold text-on-dark md:text-h3">Your basket</h1>
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
