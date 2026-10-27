import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** 1170px content column with 24px gutters (16px on mobile). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("mx-auto w-full max-w-page px-4 sm:px-6", className)} {...props} />;
}
