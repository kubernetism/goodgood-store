import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, type CartTotals } from "../pricing";

type OrderSummaryProps = {
  totals: CartTotals;
  /** Show each line before the totals; the cart page lists lines separately. */
  showLines?: boolean;
};

/** Subtotal, delivery and the cash-on-delivery total, as a description list. */
export function OrderSummary({ totals, showLines = false }: OrderSummaryProps) {
  const rowClass = "flex items-baseline justify-between gap-4";

  return (
    <dl className="space-y-3 text-sm text-body">
      {showLines &&
        totals.lines.map((line) => (
          <div key={line.slug} className={rowClass}>
            <dt className="min-w-0">
              {line.product.name} × {line.quantity}
            </dt>
            <dd className="tabular-nums text-strong">{formatPrice(line.lineTotal)}</dd>
          </div>
        ))}
      <div className={rowClass}>
        <dt>Subtotal</dt>
        <dd className="tabular-nums text-strong">{formatPrice(totals.subtotal)}</dd>
      </div>
      <div className={rowClass}>
        <dt>
          Delivery
          {totals.shipping > 0 && (
            <span className="block text-meta text-muted">Free on orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} or more</span>
          )}
        </dt>
        <dd className={totals.shipping === 0 ? "font-semibold text-primary-ink" : "tabular-nums text-strong"}>
          {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
        </dd>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-dashed border-border-strong/40 pt-4">
        <dt className="font-semibold text-strong">
          Total
          <span className="block text-meta font-normal text-muted">Pay in cash on delivery</span>
        </dt>
        <dd className="font-heading text-promo font-semibold text-strong tabular-nums">{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}
