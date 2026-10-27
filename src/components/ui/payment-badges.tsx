import { cx } from "@/lib/cx";

// Placeholder list until the Pakistani payment providers are confirmed.
const methods = ["Cash on Delivery", "Visa", "Mastercard", "Bank Transfer"] as const;

/** Text stand-ins for payment-network logos (no images in this build). */
export function PaymentBadges({ className }: { className?: string }) {
  return (
    <ul aria-label="Accepted payment methods" className={cx("flex flex-wrap gap-2", className)}>
      {methods.map((method) => (
        <li
          key={method}
          className="inline-flex h-7 items-center rounded-sm border border-border bg-ivory px-2 font-display text-badge font-bold text-strong"
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
