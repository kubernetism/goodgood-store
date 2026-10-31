"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { MediaImage } from "@/components/ui/media-image";
import type { ImageAsset } from "@/features/products/types";
import { youtubeEmbedUrl, youtubeThumbnailUrl, type YouTubeVideo } from "@/lib/youtube";

type VideoBlockProps = {
  /** Poster from the "home.story" slot; falls back to the YouTube still, then the placeholder. */
  poster: ImageAsset | null;
  video: YouTubeVideo | null;
  title: string;
};

/**
 * Beekeeping story: wide still with a centred play button that opens a modal.
 * The YouTube player (youtube-nocookie.com) is only created when the modal
 * opens and is removed when it closes, so the page loads no YouTube code and
 * sets no YouTube cookies until a visitor asks to watch.
 */
export function VideoBlock({ poster, video, title }: VideoBlockProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const close = () => dialogRef.current?.close();

  const posterAspect = "aspect-video lg:aspect-[39/17]";

  return (
    <>
      <div className="relative overflow-hidden rounded-lg">
        {poster ? (
          <MediaImage image={poster} sizes="(min-width: 1200px) 1170px, 100vw" aspect={posterAspect} />
        ) : video ? (
          <span className={`relative block overflow-hidden bg-brown-950 ${posterAspect}`}>
            <Image src={youtubeThumbnailUrl(video.id)} alt="" fill sizes="(min-width: 1200px) 1170px, 100vw" className="object-cover" />
          </span>
        ) : (
          <ImagePlaceholder icon={BeeIcon} iconSize="xl" tone="honey" aspect={posterAspect} />
        )}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setIsPlaying(true);
            dialogRef.current?.showModal();
          }}
          className="group absolute top-1/2 left-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-strong/25 transition-transform duration-200 hover:scale-105 motion-reduce:hover:scale-100"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-strong text-primary shadow-card-hover">
            <Play className="ml-1 size-6" fill="currentColor" aria-hidden="true" />
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        // Unmount the player on close so playback (and audio) stops.
        onClose={() => setIsPlaying(false)}
        className="m-auto w-[min(56rem,calc(100%-2rem))] max-w-none rounded-lg bg-brown-950 p-0"
      >
        <div className="relative">
          {video && isPlaying ? (
            <div className="aspect-video">
              <iframe
                src={youtubeEmbedUrl(video)}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="size-full"
              />
            </div>
          ) : (
            <ImagePlaceholder icon={BeeIcon} iconSize="xl" tone="dark" aspect="aspect-video" caption="Video coming soon" />
          )}
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
