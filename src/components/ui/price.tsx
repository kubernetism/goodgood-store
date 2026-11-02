import { formatPrice } from "@/lib/format";
import { cx } from "@/lib/cx";

type PriceProps = {
  /** Current price in paisa. */
  price: number;
  /** Original price in paisa; rendered struck through when higher than `price`. */
  compareAtPrice?: number;
  size?: "md" | "lg";
  /** `dark` for brown bands: honey price (9.42:1), cream old price. */
  tone?: "light" | "dark";
  className?: string;
};

/** Price in amber ink (5.93:1 on white) followed by the struck-through old price. */
export function Price({ price, compareAtPrice, size = "md", tone = "light", className }: PriceProps) {
  const isDiscounted = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <p className={cx("flex flex-wrap items-baseline gap-x-2 font-semibold", className)}>
      <span
        className={cx(
          tone === "dark" ? "text-primary" : "text-primary-ink",
          size === "lg" ? "text-h3 lg:text-price-lg" : "text-price",
        )}
      >
        <span className="sr-only">{isDiscounted ? "Sale price " : "Price "}</span>
        {formatPrice(price)}
      </span>
      {isDiscounted && (
        <del
          className={cx(
            tone === "dark" ? "text-on-dark-muted" : "text-muted",
            size === "lg" ? "text-h4 lg:text-promo" : "text-price-old",
          )}
        >
          <span className="sr-only">was </span>
          {formatPrice(compareAtPrice)}
        </del>
      )}
    </p>
  );
}

export function discountPercent(price: number, compareAtPrice?: number): number | null {
  if (compareAtPrice === undefined || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** Discount badge: "-19%" in brown on the honey fill (9.42:1). */
export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-full bg-primary px-2.5 text-badge font-bold text-strong",
        className,
      )}
    >
      <span aria-hidden="true">-{percent}%</span>
      <span className="sr-only">{percent}% off</span>
    </span>
  );
}

/** "Sold out" chip in the same slot as the discount badge (brown on ivory, 15.48:1). */
export function SoldOutBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-7 items-center rounded-full bg-strong px-3 text-badge font-bold tracking-wide text-on-dark uppercase",
        className,
      )}
    >
      Sold out
    </span>
  );
}
