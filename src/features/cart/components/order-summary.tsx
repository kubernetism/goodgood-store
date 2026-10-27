import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, type CartTotals } from "../pricing";

type OrderSummaryProps = {
  totals: CartTotals;
  /** Show each line (checkout) or only the totals (cart page). */
  showLines?: boolean;
};

/** "Cart Total" table: optional line items, subtotal, shipping and order total. */
export function OrderSummary({ totals, showLines = false }: OrderSummaryProps) {
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - totals.subtotal;

  return (
    <div>
      <table className="w-full text-sm text-strong">
        <caption className="sr-only">Order summary</caption>
        <tbody>
          {showLines &&
            totals.lines.map((line) => (
              <tr key={line.slug} className="border-b border-surface bg-tile">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  {line.product.name} × {line.quantity}
                </th>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(line.lineTotal)}</td>
              </tr>
            ))}
          <tr className="border-b border-surface bg-tile">
            <th scope="row" className="px-4 py-3 text-left font-normal">
              Subtotal
            </th>
            <td className="px-4 py-3 text-right tabular-nums">{formatPrice(totals.subtotal)}</td>
          </tr>
          <tr className="border-b border-surface bg-tile">
            <th scope="row" className="px-4 py-3 text-left font-normal">
              Shipping
            </th>
            <td className="px-4 py-3 text-right tabular-nums">
              {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            </td>
          </tr>
          <tr className="bg-tile">
            <th scope="row" className="px-4 py-3 text-left font-bold">
              Order Total
            </th>
            <td className="px-4 py-3 text-right font-bold tabular-nums">{formatPrice(totals.total)}</td>
          </tr>
        </tbody>
      </table>
      {totals.subtotal > 0 && remainingForFreeShipping > 0 && (
        <p className="mt-3 text-meta">
          Add <strong className="text-strong">{formatPrice(remainingForFreeShipping)}</strong> more for free shipping.
        </p>
      )}
    </div>
  );
}
