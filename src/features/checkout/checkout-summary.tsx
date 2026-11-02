"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Banknote, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoneycombMark } from "@/components/ui/honeycomb-mark";
import { MediaImage } from "@/components/ui/media-image";
import { freeShippingProgress, type CartTotals } from "@/features/cart/pricing";
import { categoryIcon } from "@/features/products/category-icons";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { cx } from "@/lib/cx";
import { DELIVERY_ESTIMATE, itemCountLabel } from "./messages";

/** Where shoppers get help: the order WhatsApp number when set, else the shop phone. */
export type CheckoutHelp = { href: string; label: string; external: boolean };

/** Items with thumbnails and quantity badges. Lines changed by a stock update flash honey once. */
export function SummaryLines({ totals, highlighted }: { totals: CartTotals; highlighted: ReadonlySet<string> }) {
  const scrolls = totals.lines.length > 4;
  return (
    <ul
      className={cx("border-y border-border", scrolls && "max-h-64 overflow-y-auto overscroll-contain")}
      // A scrolling list must be reachable by keyboard (WCAG 2.1.1).
      {...(scrolls ? { tabIndex: 0, "aria-label": "Items in your order" } : {})}
    >
      {totals.lines.map((line) => (
        <li
          key={line.slug}
          className={cx(
            "grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 last:border-b-0",
            highlighted.has(line.slug) && "motion-safe:animate-tint-fade motion-reduce:bg-primary-tint",
          )}
        >
          <span className="relative block size-14">
            <MediaImage image={line.product.image} alt="" sizes="56px" icon={categoryIcon(line.product.category)} iconSize="sm" rounded="sm" texture={false} className="size-14" />
            <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-brown-950 text-badge font-semibold text-on-dark tabular-nums">
              {line.quantity}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-strong">
              {line.product.name}
              <span className="sr-only">, quantity {line.quantity}</span>
            </span>
            <span className="block text-meta text-muted">{line.product.unit}</span>
          </span>
          <span className="text-sm font-semibold text-strong tabular-nums">{formatPrice(line.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}

export function SummaryTotals({ totals }: { totals: CartTotals }) {
  return (
    <dl className="space-y-2 text-sm text-body">
      <div className="flex items-baseline justify-between gap-4">
        <dt>Subtotal</dt>
        <dd className="tabular-nums text-strong">{formatPrice(totals.subtotal)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt>Delivery</dt>
        <dd className="tabular-nums text-strong">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
        <dt className="font-semibold text-strong">Total to pay on delivery</dt>
        <dd className="font-heading text-promo font-semibold text-strong tabular-nums">{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}

/** "Rs 1,250 away from free delivery" with a meter, or a confirmation once qualified. */
export function FreeDeliveryNudge({ subtotal }: { subtotal: number }) {
  const progress = freeShippingProgress(subtotal);
  if (progress.qualified) {
    return (
      <p className="flex items-center gap-2 rounded-sm bg-tile p-3 text-meta font-semibold text-strong">
        <Truck className="size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        Free delivery on this order.
      </p>
    );
  }
  return (
    <div className="rounded-sm bg-tile p-3 text-meta text-body">
      <p>
        You&apos;re <strong className="text-strong tabular-nums">{formatPrice(progress.remaining)}</strong> away from free delivery.
      </p>
      <svg className="mt-2 block h-1.5 w-full overflow-hidden rounded-full" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <rect width="100" height="6" rx="3" className="fill-border" />
        {progress.percent > 0 && <rect width={progress.percent} height="6" rx="3" className="fill-primary-ink" />}
      </svg>
      <Link href="/shop" className="mt-1 inline-flex min-h-11 items-center font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
        Add more honey
      </Link>
    </div>
  );
}

export function TrustList({ help }: { help: CheckoutHelp }) {
  const linkClass = "font-semibold text-primary-ink underline underline-offset-2 hover:no-underline";
  return (
    <ul className="space-y-2.5 text-meta text-body">
      <li className="flex gap-2.5">
        <Banknote className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        Pay in cash when it arrives. No card, no advance payment.
      </li>
      <li className="flex gap-2.5">
        <Truck className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        Delivered in {DELIVERY_ESTIMATE} across Pakistan.
      </li>
      <li className="flex gap-2.5">
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
        <span>
          Need help?{" "}
          {help.external ? (
            <a href={help.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {help.label}
              <span className="sr-only"> (opens WhatsApp)</span>
            </a>
          ) : (
            <a href={help.href} className={linkClass}>{help.label}</a>
          )}{" "}
          · {siteConfig.contact.hours}
        </span>
      </li>
    </ul>
  );
}

type PlaceOrderButtonProps = {
  total: number;
  pending: boolean;
  /** Unavailable items in the cart: the order cannot be placed yet. */
  blocked: boolean;
  /** Unique per instance: the "remove unavailable items" line it points at. */
  id: string;
  showTotal?: boolean;
  /** On the brown phone bar the "blocked" note switches to cream text. */
  tone?: "light" | "dark";
  className?: string;
};

export function PlaceOrderButton({ total, pending, blocked, id, showTotal = true, tone = "light", className }: PlaceOrderButtonProps) {
  const blockedId = `${id}-blocked`;
  return (
    <>
      <Button type="submit" disabled={pending || blocked} aria-describedby={blocked ? blockedId : undefined} className={className}>
        {pending ? (
          <>
            <HoneycombMark tone="ink" size={24} />
            Placing your order…
          </>
        ) : showTotal ? (
          <>
            Place order<span aria-hidden="true">·</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </>
        ) : (
          "Place order"
        )}
      </Button>
      {blocked && (
        <p id={blockedId} className={cx("mt-2 text-meta font-medium", tone === "dark" ? "text-on-dark" : "text-danger")}>
          Remove unavailable items to continue.
        </p>
      )}
    </>
  );
}

export function WhatsappNote() {
  return (
    <p className="mt-3 text-meta text-muted">
      WhatsApp will open with your order details so you can send them to us. Your order is placed either way.
    </p>
  );
}

/** The desktop aside: the whole order at a glance, with the only Place order button on wide screens. */
export function CheckoutSummary({ totals, highlighted, help, headingId, action }: {
  totals: CartTotals;
  highlighted: ReadonlySet<string>;
  help: CheckoutHelp;
  headingId: string;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="font-heading text-h4 font-semibold text-strong">Your order</h2>
        <span className="text-meta text-muted">{itemCountLabel(totals.itemCount)}</span>
      </div>
      <SummaryLines totals={totals} highlighted={highlighted} />
      <Link href="/cart" className="-mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
        Edit basket
      </Link>
      <SummaryTotals totals={totals} />
      <FreeDeliveryNudge subtotal={totals.subtotal} />
      {action}
      <div className="border-t border-border pt-4">
        <TrustList help={help} />
      </div>
    </div>
  );
}
