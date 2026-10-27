"use client";

import Link from "next/link";
import { ShoppingBasket, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { categoryIcons } from "@/features/products/category-icons";
import { formatPrice } from "@/lib/format";
import { useIsClient } from "@/lib/use-is-client";
import { cartActions, useCartLines } from "../cart-store";
import { MAX_LINE_QUANTITY, priceCart, type CartProduct } from "../pricing";
import { OrderSummary } from "./order-summary";

export function CartView({ catalog }: { catalog: ReadonlyArray<CartProduct> }) {
  const isClient = useIsClient();
  const lines = useCartLines();
  const totals = priceCart(lines, new Map(catalog.map((product) => [product.slug, product])));

  if (!isClient) {
    return <div aria-busy="true" aria-label="Loading cart" className="h-64 animate-pulse rounded-sm bg-tile" />;
  }

  if (totals.lines.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-dashed border-border-strong/50 px-6 py-16 text-center">
        <ShoppingBasket className="size-12 text-primary-ink" strokeWidth={1.25} aria-hidden="true" />
        <h2 className="mt-4 text-h4 font-semibold">Your cart is empty</h2>
        <p className="mt-2 max-w-sm">Fill it with raw honey from our partner apiaries.</p>
        <Link href="/shop" className={buttonClasses({ className: "mt-6" })}>
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
      <section aria-labelledby="cart-items-heading" className="lg:col-span-8">
        <h2 id="cart-items-heading" className="text-h4 font-semibold">
          {totals.itemCount === 1 ? "1 item" : `${totals.itemCount} items`} in your cart
        </h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {totals.lines.map((line) => (
            <li key={line.slug} className="grid grid-cols-[4.5rem_1fr] gap-4 py-5 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center">
              <ImagePlaceholder
                icon={categoryIcons[line.product.category]}
                iconSize="sm"
                rounded="sm"
              />
              <div className="min-w-0">
                <h3 className="font-sans text-sm font-semibold text-strong">
                  <Link href={`/shop/${line.slug}`} className="hover:text-primary-ink">
                    {line.product.name}
                  </Link>
                </h3>
                <p className="text-meta">
                  {line.product.unit} · {formatPrice(line.product.price)} each
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:justify-end">
                <QuantityStepper
                  id={`cart-qty-${line.slug}`}
                  label={`Quantity of ${line.product.name}`}
                  value={line.quantity}
                  onChange={(quantity) => cartActions.setQuantity(line.slug, quantity)}
                  max={MAX_LINE_QUANTITY}
                  size="sm"
                />
                <p className="w-20 text-right font-display font-semibold text-strong tabular-nums">
                  {formatPrice(line.lineTotal)}
                </p>
                <button
                  type="button"
                  onClick={() => cartActions.remove(line.slug)}
                  className="flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-tile hover:text-danger"
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">Remove {line.product.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap justify-between gap-4">
          <Link href="/shop" className="text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => cartActions.clear()}
            className="text-sm font-semibold text-muted underline underline-offset-2 hover:text-danger"
          >
            Clear cart
          </button>
        </div>
      </section>

      <section aria-labelledby="cart-total-heading" className="lg:col-span-4">
        <h2 id="cart-total-heading" className="mb-6 text-h4 font-semibold">
          Cart Total
        </h2>
        <OrderSummary totals={totals} />
        <Link href="/checkout" className={buttonClasses({ className: "mt-6 w-full" })}>
          Proceed to checkout
        </Link>
      </section>
    </div>
  );
}
