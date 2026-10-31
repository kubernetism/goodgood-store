import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cx } from "@/lib/cx";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** Builds the URL for a given page number. */
  hrefFor: (page: number) => string;
  label?: string;
  className?: string;
};

const square =
  "flex size-11 items-center justify-center rounded-full border font-display text-sm font-semibold transition-colors duration-200";

/** Numbered pagination with previous/next links. Renders nothing for one page. */
export function Pagination({ page, pageCount, hrefFor, label = "Pagination", className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={cx(square, "border-border text-strong hover:bg-primary")}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="sr-only">Previous page</span>
            </Link>
          ) : (
            <span aria-hidden="true" className={cx(square, "border-border text-muted opacity-50")}>
              <ArrowLeft className="size-4" />
            </span>
          )}
        </li>
        {pages.map((number) => (
          <li key={number}>
            <Link
              href={hrefFor(number)}
              aria-current={number === page ? "page" : undefined}
              className={cx(
                square,
                number === page
                  ? "border-strong bg-strong text-on-dark"
                  : "border-border text-strong hover:border-strong hover:bg-primary-tint",
              )}
            >
              <span className="sr-only">Page </span>
              {number}
            </Link>
          </li>
        ))}
        <li>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} className={cx(square, "border-border text-strong hover:bg-primary")}>
              <ArrowRight className="size-4" aria-hidden="true" />
              <span className="sr-only">Next page</span>
            </Link>
          ) : (
            <span aria-hidden="true" className={cx(square, "border-border text-muted opacity-50")}>
              <ArrowRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
