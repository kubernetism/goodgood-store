"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartItemCount } from "@/features/cart/cart-store";

/** Header cart button with a live item-count badge. */
export function CartLink({ availableSlugs }: { availableSlugs: string[] }) {
  const count = useCartItemCount(availableSlugs);
  const label = count === 1 ? "Cart, 1 item" : `Cart, ${count} items`;

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative flex size-11 items-center justify-center rounded-full bg-surface text-strong shadow-card transition-colors duration-200 hover:text-primary-ink"
    >
      <ShoppingCart className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-strong px-1 text-badge font-bold text-on-dark"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
