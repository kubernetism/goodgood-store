"use client";

import { createContext, use, useState, type ReactNode } from "react";
import type { ImageOption } from "./image-options";

export type { ImageOption };

type MediaOptions = { options: ReadonlyArray<ImageOption>; addOption: (image: ImageOption) => void };

const MediaOptionsContext = createContext<MediaOptions | null>(null);

/**
 * The media library, sent to the client once per page and shared by every
 * image picker on it (instead of once per picker). Uploads from any picker
 * become available to all of them.
 */
export function MediaOptionsProvider({ images, children }: { images: ReadonlyArray<ImageOption>; children: ReactNode }) {
  const [options, setOptions] = useState<ReadonlyArray<ImageOption>>(images);
  const [serverImages, setServerImages] = useState(images);
  // A server re-render (after an upload elsewhere) brings a fresh list; keep client uploads too.
  if (images !== serverImages) {
    setServerImages(images);
    setOptions((current) => [...current.filter((item) => !images.some((image) => image.id === item.id) && !serverImages.some((image) => image.id === item.id)), ...images]);
  }
  const addOption = (image: ImageOption) => setOptions((current) => current.some((item) => item.id === image.id) ? current : [image, ...current]);
  return <MediaOptionsContext value={{ options, addOption }}>{children}</MediaOptionsContext>;
}

export function useMediaOptions(): MediaOptions {
  const value = use(MediaOptionsContext);
  if (!value) throw new Error("Image pickers must be rendered inside <MediaOptionsProvider>.");
  return value;
}

