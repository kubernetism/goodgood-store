"use client";

import { useRef, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { cartActions } from "@/features/cart/cart-store";
import { cx } from "@/lib/cx";

type AddToCartButtonProps = {
  slug: string;
  productName: string;
  quantity?: number;
  /** `icon`: round icon button (cards). `full`: labelled primary button. */
  variant?: "icon" | "full";
  className?: string;
};

const CONFIRMATION_MS = 2000;

export function AddToCartButton({ slug, productName, quantity = 1, variant = "icon", className }: AddToCartButtonProps) {
  const [justAdded, setJustAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function addToCart() {
    cartActions.add(slug, quantity);
    setJustAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustAdded(false), CONFIRMATION_MS);
  }

  const Icon = justAdded ? Check : ShoppingCart;

  return (
    <>
      <button
        type="button"
        onClick={addToCart}
        className={cx(
          "inline-flex items-center justify-center transition-colors duration-200",
          variant === "icon"
            ? "size-11 rounded-full bg-surface text-strong shadow-card hover:bg-primary"
            : "h-12 gap-2 rounded-full bg-primary px-7 text-button font-semibold tracking-[0.06em] text-strong uppercase hover:bg-primary-hover",
          className,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
        {variant === "full" ? (
          <span>{justAdded ? "Added" : "Add to cart"}</span>
        ) : (
          <span className="sr-only">Add {productName} to cart</span>
        )}
      </button>
      <span role="status" className="sr-only">
        {justAdded ? `${productName} added to cart` : ""}
      </span>
    </>
  );
}
