"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Banknote, Phone, ShoppingBasket, Trash2, TriangleAlert, Truck } from "lucide-react";
import { HoneyJarIcon } from "@/components/icons/honey-icons";
import { buttonClasses } from "@/components/ui/button";
import { HoneycombLoader } from "@/components/ui/honeycomb-mark";
import { MediaImage } from "@/components/ui/media-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { DELIVERY_ESTIMATE, itemCountLabel } from "@/features/checkout/messages";
import { categoryIcon } from "@/features/products/category-icons";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { useIsClient } from "@/lib/use-is-client";
import { cx } from "@/lib/cx";
import { cartActions, useCartLines } from "../cart-store";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_LINE_QUANTITY,
  freeShippingProgress,
  partitionCartLines,
  priceCart,
  type CartProduct,
  type CartTotals,
  type PricedLine,
} from "../pricing";
import { OrderSummary } from "./order-summary";
import { UnavailableCartItems } from "./unavailable-cart-items";
import "./cart.css";

/** Focus lands here after a line is removed or the basket is cleared (present in both the list and empty states). */
const HEADING_ID = "cart-heading";
const CLEAR_ID = "cart-clear";
const KEEP_ID = "cart-clear-keep";
const BLOCKED_NOTE_ID = "cart-blocked-note";

const linkClass = "font-semibold text-primary-ink underline underline-offset-2 hover:no-underline";

/** "3 items, total Rs 4,250." plus a note when the change unlocked free delivery. */
function totalsSentence(next: CartTotals, before: CartTotals): string {
  if (next.lines.length === 0) return "Your basket is empty.";
  const freeNow = next.shipping === 0 && before.shipping > 0 ? " Free delivery unlocked." : "";
  return `${itemCountLabel(next.itemCount)}, total ${formatPrice(next.total)}.${freeNow}`;
}

export function CartView({ catalog }: { catalog: ReadonlyArray<CartProduct> }) {
  const isClient = useIsClient();
  const lines = useCartLines();
  const catalogBySlug = new Map(catalog.map((product) => [product.slug, product]));
  const totals = priceCart(lines, catalogBySlug);
  const { unavailable } = partitionCartLines(lines, new Set(catalog.map((product) => product.slug)));

  /** Screen-reader summary of the last change (quantity, removal, clear). */
  const [announcement, setAnnouncement] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  // Starts hidden so the bar never flashes over an on-screen checkout button.
  const [barHidden, setBarHidden] = useState(true);

  if (!isClient) return <CartSkeleton />;

  function changeQuantity(line: PricedLine, quantity: number) {
    if (quantity === line.quantity) return;
    cartActions.setQuantity(line.slug, quantity);
    const next = priceCart(
      lines.map((item) => (item.slug === line.slug ? { ...item, quantity } : item)),
      catalogBySlug,
    );
    setAnnouncement(`${line.product.name}: quantity ${quantity}. ${totalsSentence(next, totals)}`);
  }

  function removeLine(line: PricedLine) {
    const next = priceCart(
      lines.filter((item) => item.slug !== line.slug),
      catalogBySlug,
    );
    // Render the shorter list first, so focus moves to the heading of the final layout.
    flushSync(() => {
      cartActions.remove(line.slug);
      setAnnouncement(`Removed ${line.product.name}. ${totalsSentence(next, totals)}`);
    });
    document.getElementById(HEADING_ID)?.focus();
  }

  function askToClear() {
    flushSync(() => setConfirmingClear(true));
    document.getElementById(KEEP_ID)?.focus();
  }

  function keepBasket() {
    flushSync(() => setConfirmingClear(false));
    document.getElementById(CLEAR_ID)?.focus();
  }

  function clearBasket() {
    flushSync(() => {
      cartActions.clear();
      setConfirmingClear(false);
      setAnnouncement("Basket cleared. Your basket is empty.");
    });
    document.getElementById(HEADING_ID)?.focus();
  }

  // The phone checkout bar hides while the summary's checkout button is on
  // screen or scrolled past, so only one primary action shows at a time and
  // the bar never covers the footer.
  function observeCheckoutButton(node: HTMLDivElement | null) {
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setBarHidden(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setBarHidden(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }

  const isEmpty = totals.lines.length === 0;
  const blocked = unavailable.length > 0;

  return (
    <div data-cart="">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {isEmpty ? (
        <div className="mx-auto max-w-3xl space-y-6">
          <UnavailableCartItems lines={unavailable} />
          <EmptyBasket hasUnavailable={blocked} />
        </div>
      ) : (
        <div className="space-y-6">
          <UnavailableCartItems lines={unavailable} />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-14">
            <section aria-labelledby={HEADING_ID} className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h2 id={HEADING_ID} tabIndex={-1} className="text-h4 font-semibold text-strong outline-offset-4 sm:text-promo">
                  {itemCountLabel(totals.itemCount)} in your basket
                </h2>
                {confirmingClear ? (
                  <div role="group" aria-label="Clear basket?" className="flex items-center gap-1 text-sm">
                    <span className="mr-1 text-body">Remove everything?</span>
                    <button
                      type="button"
                      onClick={clearBasket}
                      className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold text-danger underline underline-offset-2 hover:no-underline"
                    >
                      Yes, clear
                    </button>
                    <button
                      id={KEEP_ID}
                      type="button"
                      onClick={keepBasket}
                      className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold text-strong underline underline-offset-2 hover:no-underline"
                    >
                      Keep items
                    </button>
                  </div>
                ) : (
                  <button
                    id={CLEAR_ID}
                    type="button"
                    onClick={askToClear}
                    className="-mr-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted transition-colors duration-200 hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Clear basket
                  </button>
                )}
              </div>

              <FreeDeliveryMeter subtotal={totals.subtotal} className="mt-4" />

              <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-surface">
                {totals.lines.map((line, index) => (
                  <CartLineItem
                    key={line.slug}
                    line={line}
                    index={index}
                    onQuantityChange={(quantity) => changeQuantity(line, quantity)}
                    onRemove={() => removeLine(line)}
                  />
                ))}
              </ul>

              <Link href="/shop" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-ink underline-offset-2 hover:underline">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Continue shopping
              </Link>
            </section>

            <aside aria-labelledby="cart-summary-heading" className="self-start lg:sticky lg:top-26">
              <div className="cart-summary-card rounded-md border border-border bg-surface p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="cart-summary-heading" className="text-h4 font-semibold text-strong sm:text-promo">
                    Order summary
                  </h2>
                  <span className="text-meta text-muted">{itemCountLabel(totals.itemCount)}</span>
                </div>
                <div className="mt-5">
                  <OrderSummary totals={totals} />
                </div>
                <div ref={observeCheckoutButton} className="mt-6">
                  <Link
                    href="/checkout"
                    aria-describedby={blocked ? BLOCKED_NOTE_ID : undefined}
                    className={buttonClasses({ className: "group w-full" })}
                  >
                    Proceed to checkout
                    <ArrowRight className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                  {blocked && (
                    <p id={BLOCKED_NOTE_ID} className="mt-2 text-meta font-medium text-danger">
                      Remove unavailable items before you check out.
                    </p>
                  )}
                </div>
                <TrustList className="mt-6 border-t border-border pt-5" />
              </div>
            </aside>
          </div>

          <div
            className={cx(
              "cart-bar on-dark fixed inset-x-0 bottom-0 z-30 bg-brown-950 pb-[env(safe-area-inset-bottom)] text-on-dark shadow-bar lg:hidden",
              barHidden && "translate-y-full",
            )}
            inert={barHidden}
          >
            <div className="mx-auto flex max-w-page items-center gap-4 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-meta text-on-dark-muted">
                  {itemCountLabel(totals.itemCount)} · cash on delivery
                </p>
                <p className="text-h4 font-semibold text-on-dark">{formatPrice(totals.total)}</p>
              </div>
              <Link href="/checkout" className={buttonClasses({ className: "ml-auto" })}>
                Checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type CartLineItemProps = {
  line: PricedLine;
  index: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

function CartLineItem({ line, index, onQuantityChange, onRemove }: CartLineItemProps) {
  const { product } = line;
  const href = `/shop/${line.slug}`;
  const overStock = line.quantity > product.stock;

  return (
    <li
      className="cart-line grid grid-cols-[5rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5 sm:p-5"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      {/* Duplicate of the name link for pointer users; hidden from keyboard and screen readers. */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block self-start">
        <MediaImage
          image={product.image}
          alt=""
          sizes="(min-width: 640px) 104px, 80px"
          icon={categoryIcon(product.category)}
          iconSize="sm"
          rounded="sm"
          texture={false}
          bordered
        />
      </Link>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-strong">
              <Link href={href} className="rounded-sm transition-colors duration-200 hover:text-primary-ink">
                {product.name}
              </Link>
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
              <span className="rounded-full bg-tile px-2 py-0.5 font-semibold text-body">{product.unit}</span>
              <span>{formatPrice(product.price)} each</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-tile hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="sr-only">Remove {product.name}</span>
          </button>
        </div>

        {overStock && (
          <p className="flex items-center gap-1.5 text-meta font-semibold text-danger">
            <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
            {product.stock === 0 ? "Sold out: please remove it" : `Only ${product.stock} left in stock`}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            id={`cart-qty-${line.slug}`}
            label={`Quantity of ${product.name}`}
            value={line.quantity}
            onChange={onQuantityChange}
            max={Math.max(1, Math.min(MAX_LINE_QUANTITY, product.stock))}
            size="sm"
          />
          <p className="text-price font-semibold text-strong">{formatPrice(line.lineTotal)}</p>
        </div>
      </div>
    </li>
  );
}

/** Honey "fill level" towards free delivery, from the shop's real threshold. */
function FreeDeliveryMeter({ subtotal, className }: { subtotal: number; className?: string }) {
  const progress = freeShippingProgress(subtotal);
  const fill = { "--cart-fill": progress.percent / 100 } as CSSProperties;

  return (
    <div className={cx("rounded-md bg-primary-tint p-4", className)}>
      <p className="flex items-start gap-2.5 text-sm text-strong">
        <Truck className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        {progress.qualified ? (
          <span>
            <strong>Free delivery</strong> unlocked on this order.
          </span>
        ) : (
          <span>
            Add <strong>{formatPrice(progress.remaining)}</strong> more for free delivery.{""}
            <Link href="/shop" className={linkClass}>
              Add more honey
            </Link>
          </span>
        )}
      </p>
      <div className="cart-meter mt-3" aria-hidden="true">
        <span className="cart-meter__fill" style={fill} />
      </div>
      {!progress.qualified && (
        <p className="mt-1.5 text-right text-meta text-muted">Free at {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
      )}
    </div>
  );
}

function TrustList({ className }: { className?: string }) {
  const { phoneHref, phoneDisplay } = siteConfig.contact.primary;
  return (
    <ul className={cx("space-y-3 text-meta text-body", className)}>
      <li className="flex gap-2.5">
        <Banknote className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-strong">Cash on delivery.</strong> Pay when your honey arrives. No card, no advance
          payment.
        </span>
      </li>
      <li className="flex gap-2.5">
        <Truck className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        Delivered in {DELIVERY_ESTIMATE} across Pakistan.
      </li>
      <li className="flex gap-2.5">
        <Phone className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        <span>
          Questions?{" "}
          <a href={phoneHref} className={linkClass}>
            Call {phoneDisplay}
          </a>
        </span>
      </li>
    </ul>
  );
}

function EmptyBasket({ hasUnavailable }: { hasUnavailable: boolean }) {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative isolate overflow-hidden rounded-lg border border-border bg-ivory px-6 py-14 text-center sm:py-20"
    >
      <span aria-hidden="true" className="mask-honeycomb-fade absolute inset-0 -z-10 text-primary/20" />
      <span aria-hidden="true" className="relative mx-auto grid size-24 place-items-center rounded-full bg-primary-tint text-primary-ink">
        <HoneyJarIcon className="size-12" strokeWidth={1.25} />
        <ShoppingBasket className="absolute -right-1 -bottom-1 size-9 rounded-full bg-surface p-1.5 text-strong shadow-card" strokeWidth={1.5} />
      </span>
      <p className="mt-6 text-kicker text-primary-ink">Nothing here yet</p>
      <h2 id={HEADING_ID} tabIndex={-1} className="mt-2 text-h4 font-semibold text-strong outline-offset-4 sm:text-promo">
        {hasUnavailable ? "Nothing in your basket can be ordered right now" : "Your basket is waiting for honey"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-pretty">{siteConfig.tagline} Add a jar or two and it will be here when you are ready.</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className={buttonClasses()}>
          Browse honey
        </Link>
        <Link href="/track-order" className={buttonClasses({ variant: "outline" })}>
          Track an order
        </Link>
      </div>
    </section>
  );
}

/** Same footprint as the loaded basket, so nothing jumps when the cart (localStorage) is read. */
function CartSkeleton() {
  return (
    <div aria-busy="true" className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-14">
      <div className="space-y-4">
        <div aria-hidden="true" className="h-8 w-48 rounded-sm bg-tile motion-safe:animate-pulse" />
        <div aria-hidden="true" className="h-24 rounded-md bg-tile motion-safe:animate-pulse" />
        <div className="relative">
          <div aria-hidden="true" className="h-64 rounded-md bg-tile motion-safe:animate-pulse" />
          <HoneycombLoader label="Loading your basket…" showLabel className="absolute inset-0 justify-center" />
        </div>
      </div>
      <div aria-hidden="true" className="h-96 rounded-md bg-tile motion-safe:animate-pulse" />
    </div>
  );
}
