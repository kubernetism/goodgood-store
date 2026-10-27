import { Star, StarHalf } from "lucide-react";
import { cx } from "@/lib/cx";

type RatingStarsProps = {
  /** 0–5, rounded to the nearest half star for display. */
  rating: number;
  size?: "sm" | "md";
  className?: string;
};

/** Five stars, exposed to assistive tech as "4.5 out of 5 stars". */
export function RatingStars({ rating, size = "sm", className }: RatingStarsProps) {
  const rounded = Math.round(Math.min(5, Math.max(0, rating)) * 2) / 2;
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span
      role="img"
      aria-label={`${rounded} out of 5 stars`}
      className={cx("inline-flex items-center gap-1 text-star", className)}
    >
      {[1, 2, 3, 4, 5].map((position) => {
        if (rounded >= position) {
          return <Star key={position} className={iconSize} fill="currentColor" strokeWidth={0} aria-hidden="true" />;
        }
        if (rounded === position - 0.5) {
          return (
            <span key={position} className={cx("relative inline-block", iconSize)} aria-hidden="true">
              <Star className={cx("absolute inset-0", iconSize)} strokeWidth={1.5} />
              <StarHalf className={cx("absolute inset-0", iconSize)} fill="currentColor" strokeWidth={0} />
            </span>
          );
        }
        return <Star key={position} className={iconSize} strokeWidth={1.5} aria-hidden="true" />;
      })}
    </span>
  );
}
