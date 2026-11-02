import { cx } from "@/lib/cx";

// Cash on delivery is the only payment method (Pakistan only).
const methods = ["Cash on Delivery"] as const;

/** Text stand-ins for payment-network logos (no images in this build). */
export function PaymentBadges({ className }: { className?: string }) {
  return (
    <ul aria-label="Accepted payment methods" className={cx("flex flex-wrap gap-2", className)}>
      {methods.map((method) => (
        <li
          key={method}
          className="inline-flex h-7 items-center rounded-sm border border-border bg-ivory px-2 text-badge font-bold text-strong"
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
