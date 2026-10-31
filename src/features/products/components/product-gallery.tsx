"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { MediaImage } from "@/components/ui/media-image";
import { DiscountBadge, SoldOutBadge } from "@/components/ui/price";
import { cx } from "@/lib/cx";
import { categoryIcon } from "../category-icons";
import type { ImageAsset } from "../types";

/** Placeholder views shown until the product has photos. */
const placeholderViews = ["Jar", "Pour", "Close-up", "Packaging"] as const;

type ProductGalleryProps = {
  productName: string;
  category: string;
  images: ReadonlyArray<ImageAsset>;
  discount: number | null;
  isSoldOut: boolean;
};

/**
 * Main image + thumbnails with previous/next arrows (mockup: Shop details).
 * Uses the product's uploaded photos; without any it shows four named
 * placeholder views so the layout stays intact.
 */
export function ProductGallery({ productName, category, images, discount, isSoldOut }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const Icon = categoryIcon(category);
  const count = images.length > 0 ? images.length : placeholderViews.length;
  const current = Math.min(active, count - 1);
  const step = (delta: number) => setActive((index) => (index + delta + count) % count);
  const currentImage = images[current];

  return (
    <div>
      <div className="relative">
        {currentImage ? (
          <MediaImage
            image={currentImage}
            sizes="(min-width: 1024px) 370px, (min-width: 768px) 45vw, 100vw"
            preload={current === 0}
            aspect="aspect-[4/5]"
            rounded="lg"
          />
        ) : (
          <ImagePlaceholder
            label={`${productName}, ${placeholderViews[current]?.toLowerCase()} (image coming soon)`}
            caption={placeholderViews[current]}
            icon={Icon}
            iconSize="lg"
            aspect="aspect-[4/5]"
            rounded="lg"
          />
        )}
        {isSoldOut ? (
          <SoldOutBadge className="absolute top-4 left-4" />
        ) : (
          discount !== null && <DiscountBadge percent={discount} className="absolute top-4 left-4" />
        )}
      </div>

      {currentImage?.caption && <p className="mt-3 text-sm text-muted">{currentImage.caption}</p>}

      {count > 1 && (
        <>
          <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="Product images">
            {Array.from({ length: count }, (_, index) => {
              const image = images[index];
              const name = image ? `image ${index + 1}` : placeholderViews[index]?.toLowerCase();
              return (
                <li key={image?.url ?? placeholderViews[index]}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-pressed={index === current}
                    className={cx(
                      "block w-full overflow-hidden rounded-md border-2 transition-colors duration-200",
                      index === current ? "border-strong" : "border-transparent hover:border-border-strong",
                    )}
                  >
                    <MediaImage image={image} alt="" sizes="90px" icon={Icon} iconSize="sm" texture={false} />
                    <span className="sr-only">Show {name}</span>
                  </button>
                </li>
              );
            })}
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
        </>
      )}
    </div>
  );
}
