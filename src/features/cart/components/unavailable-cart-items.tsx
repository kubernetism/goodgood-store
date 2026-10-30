"use client";

import { StarButton } from "@/components/ui/star-controls";
import { cartActions } from "../cart-store";
import type { CartLine } from "../pricing";

export function UnavailableCartItems({ lines }: { lines: ReadonlyArray<CartLine> }) {
  if (lines.length === 0) return null;

  return (
    <section aria-labelledby="unavailable-items-heading" className="rounded-md border border-border bg-ivory p-5 sm:p-6">
      <h2 id="unavailable-items-heading" className="font-subtitle text-base font-bold text-strong">
        Some items are no longer available
      </h2>
      <p className="mt-2 text-sm">These items are no longer in our shop and are not included in your total. Remove them before placing an order.</p>
      <ul className="mt-3 list-inside list-disc text-sm text-strong">
        {lines.map((line) => (
          <li key={line.slug}>{line.slug.replace(/[-_]+/g, " ")} <span className="text-muted">(quantity: {line.quantity})</span></li>
        ))}
      </ul>
      <StarButton
        type="button"
        onClick={() => cartActions.removeMany(lines.map((line) => line.slug))}
        className="mt-4 text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline"
      >
        Remove unavailable items
      </StarButton>
    </section>
  );
}
