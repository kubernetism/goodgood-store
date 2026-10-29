"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { MAX_LINE_QUANTITY } from "@/features/cart/pricing";

type QuantityAddToCartProps = { slug: string; productName: string; stock: number };

/** Shown as "Only N left" at or below this count. */
const LOW_STOCK = 5;

/** Quantity stepper (− 2 +) followed by the primary Add to cart button, capped to the stock on hand. */
export function QuantityAddToCart({ slug, productName, stock }: QuantityAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const max = Math.min(MAX_LINE_QUANTITY, stock);

  if (stock <= 0) {
    return (
      <p className="inline-flex h-12 items-center rounded-full border-2 border-border-strong px-7 text-button font-semibold tracking-[0.06em] text-muted uppercase">
        Sold out
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper
          id={`qty-${slug}`}
          label={`Quantity of ${productName}`}
          value={Math.min(quantity, max)}
          onChange={setQuantity}
          max={max}
        />
        <AddToCartButton
          slug={slug}
          productName={productName}
          quantity={Math.min(quantity, max)}
          variant="full"
          className="flex-1 sm:flex-none sm:px-10"
        />
      </div>
      {stock <= LOW_STOCK && <p className="text-meta font-semibold text-primary-ink">Only {stock} left in stock</p>}
    </div>
  );
}
