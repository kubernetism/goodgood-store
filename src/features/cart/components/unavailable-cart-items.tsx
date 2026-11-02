"use client";

import { PackageX } from "lucide-react";
import { cartActions } from "../cart-store";
import type { CartLine } from "../pricing";

/** Saved items that left the shop: excluded from totals and must be removed before ordering (cart and checkout). */
export function UnavailableCartItems({ lines }: { lines: ReadonlyArray<CartLine> }) {
  if (lines.length === 0) return null;

  return (
    <section
      aria-labelledby="unavailable-items-heading"
      className="flex gap-4 rounded-md border border-primary-ink/30 bg-primary-tint p-4 sm:p-5"
    >
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-primary-ink">
        <PackageX className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="unavailable-items-heading" className="text-base font-bold text-strong">
          {lines.length === 1 ? "1 item is no longer available" : `${lines.length} items are no longer available`}
        </h2>
        <p className="mt-1 text-sm">
          {lines.length === 1 ? "It has" : "They have"} left our shop and {lines.length === 1 ? "is" : "are"} not included in your total. Remove {lines.length === 1 ? "it" : "them"} before placing an order.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {lines.map((line) => (
            <li
              key={line.slug}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-meta text-strong capitalize"
            >
              <span className="line-through decoration-border-strong">{line.slug.replace(/[-_]+/g, " ")}</span>
              <span className="text-muted normal-case">× {line.quantity}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => cartActions.removeMany(lines.map((line) => line.slug))}
          className="mt-3 inline-flex min-h-11 items-center rounded-full border-2 border-strong px-5 text-button font-semibold uppercase text-strong transition-colors duration-200 hover:bg-strong hover:text-on-dark"
        >
          Remove unavailable {lines.length === 1 ? "item" : "items"}
        </button>
      </div>
    </section>
  );
}
