"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { DiscountBadge } from "@/components/ui/price";
import { cx } from "@/lib/cx";
import { categoryIcons } from "../category-icons";
import type { CategorySlug } from "../data";

const views = ["Jar", "Pour", "Close-up", "Packaging"] as const;

type ProductGalleryProps = {
  productName: string;
  category: CategorySlug;
  discount: number | null;
};

/**
 * Main image + 4 thumbnails with previous/next arrows (mockup: Shop details).
 * Images are placeholders for now; the selected view is named in each slot.
 */
export function ProductGallery({ productName, category, discount }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const Icon = categoryIcons[category];
  const step = (delta: number) => setActive((index) => (index + delta + views.length) % views.length);

  return (
    <div>
      <div className="relative">
        <ImagePlaceholder
          label={`${productName}, ${views[active].toLowerCase()} (image coming soon)`}
          caption={views[active]}
          icon={Icon}
          iconSize="lg"
          aspect="aspect-[4/5]"
          rounded="lg"
        />
        {discount !== null && <DiscountBadge percent={discount} className="absolute top-4 left-4" />}
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="Product images">
        {views.map((view, index) => (
          <li key={view}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              className={cx(
                "block w-full overflow-hidden rounded-md border-2 transition-colors duration-200",
                index === active ? "border-strong" : "border-transparent hover:border-border-strong",
              )}
            >
              <ImagePlaceholder icon={Icon} iconSize="sm" texture={false} />
              <span className="sr-only">Show {view.toLowerCase()}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex size-11 items-center justify-center rounded-full border border-border-strong text-strong transition-colors duration-200 hover:bg-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className="sr-only">Previous image</span>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          className="flex size-11 items-center justify-center rounded-full border border-border-strong text-strong transition-colors duration-200 hover:bg-primary"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">Next image</span>
        </button>
      </div>
    </div>
  );
}
