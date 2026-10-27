"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { MAX_LINE_QUANTITY } from "@/features/cart/pricing";

type QuantityAddToCartProps = { slug: string; productName: string };

/** Quantity stepper (− 2 +) followed by the primary Add to cart button. */
export function QuantityAddToCart({ slug, productName }: QuantityAddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <QuantityStepper
        id={`qty-${slug}`}
        label={`Quantity of ${productName}`}
        value={quantity}
        onChange={setQuantity}
        max={MAX_LINE_QUANTITY}
      />
      <AddToCartButton
        slug={slug}
        productName={productName}
        quantity={quantity}
        variant="full"
        className="flex-1 sm:flex-none sm:px-10"
      />
    </div>
  );
}
