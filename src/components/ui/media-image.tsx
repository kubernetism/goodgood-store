import Image from "next/image";
import type { ImageAsset } from "@/features/products/types";
import { cx } from "@/lib/cx";
import { ImagePlaceholder, radii, type ImagePlaceholderProps } from "./image-placeholder";

type MediaImageProps = ImagePlaceholderProps & {
  /** The uploaded image for this slot; when null the styled placeholder renders instead. */
  image: ImageAsset | null | undefined;
  /** next/image `sizes`: how wide the slot renders at each breakpoint. */
  sizes: string;
  /** Preload the LCP image (hero). */
  preload?: boolean;
  /** Override the image's own alt text (e.g. "" for decorative thumbnails). */
  alt?: string;
};

/**
 * Every image slot on the site: an admin-uploaded photo (next/image, cropped
 * to the slot's aspect ratio) or, until one is set, the honey placeholder with
 * the same box. Takes the same props as ImagePlaceholder so slots swap 1:1.
 */
export function MediaImage({ image, sizes, preload = false, alt, ...placeholder }: MediaImageProps) {
  if (!image) return <ImagePlaceholder {...placeholder} />;

  const { aspect = "aspect-square", rounded = "none", bordered = false, className } = placeholder;
  return (
    <span
      className={cx(
        "relative isolate block overflow-hidden bg-tile",
        aspect,
        radii[rounded],
        bordered && "border border-border",
        className,
      )}
    >
      <Image
        src={image.url}
        alt={alt ?? image.alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
      />
    </span>
  );
}
