"use client";

import { useRef } from "react";
import { Play, X } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

/**
 * Beekeeping story: wide still with a centred play button that opens a modal.
 * No video asset exists yet, so the modal holds a placeholder too.
 */
export function VideoBlock() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <div className="relative overflow-hidden rounded-lg">
        <ImagePlaceholder icon={BeeIcon} iconSize="xl" tone="honey" aspect="aspect-video lg:aspect-[39/17]" />
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
          className="group absolute top-1/2 left-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-strong/25 transition-transform duration-200 hover:scale-105 motion-reduce:hover:scale-100"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-strong text-primary shadow-card-hover">
            <Play className="ml-1 size-6" fill="currentColor" aria-hidden="true" />
          </span>
          <span className="sr-only">Play our beekeeping story video</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Our beekeeping story video"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[min(56rem,calc(100%-2rem))] max-w-none rounded-lg bg-brown-950 p-0"
      >
        <div className="relative">
          <ImagePlaceholder icon={BeeIcon} iconSize="xl" tone="dark" aspect="aspect-video" caption="Video coming soon" />
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-surface text-strong"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close video</span>
          </button>
        </div>
      </dialog>
    </>
  );
}
