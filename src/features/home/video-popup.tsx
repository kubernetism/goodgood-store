"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { BeeIcon } from "@/components/icons/honey-icons";
import { ButtonLink } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { youtubeEmbedUrl } from "@/lib/youtube";

/** The player's boot reflow usually lands ~0.5s before its load event; this covers the stragglers. */
const PLAYER_SETTLE_MS = 500;

export type VideoPopupContent = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  youtubeId: string;
};

export type VideoPopupProps = {
  popup: VideoPopupContent;
  /** Called once the dialog has closed; the parent unmounts this component. */
  onClosed: () => void;
};

/**
 * Landing-page video pop-up (admin "Video pop-up" banner). Loaded lazily by
 * VideoPopupTrigger, so none of this is in the page's initial JavaScript.
 *
 * A native modal <dialog> gives focus containment, Escape and the top layer.
 * The YouTube player exists only while the dialog is open: closing unmounts
 * the component, which removes the iframe and stops playback. No images
 * here, so the pop-up can never become the page's LCP element.
 */
export function VideoPopup({ popup, onClosed }: VideoPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  // The Shorts player reflows itself while it boots (16:9 box -> full 9:16),
  // and Chrome counts layout shifts inside iframes towards the page's CLS,
  // weighted by the frame's area (~0.16 here). Hidden frames report none, so
  // keep it invisible until it has loaded and settled.
  const [isPlayerShown, setIsPlayerShown] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Reduced motion: no entrance transition and no autoplay (the visitor presses play).
  const reducedMotion = usePrefersReducedMotion();
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    // Start on the close button, never inside the cross-origin player.
    closeRef.current?.focus();
    return () => {
      clearTimeout(revealTimer.current);
      if (dialog.open) dialog.close();
    };
  }, []);

  const embed = youtubeEmbedUrl({ id: popup.youtubeId, start: null }, { autoplay: !reducedMotion, mute: !reducedMotion });
  const hasCta = Boolean(popup.ctaLabel && popup.ctaHref);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-lock-scroll=""
      onClick={(event) => {
        // A click on the dialog box itself (not its content) is the backdrop.
        if (event.target === event.currentTarget) close();
      }}
      onClose={(event) => {
        // StrictMode's dev remount queues a stale close event after re-opening.
        if (!event.currentTarget.open) onClosed();
      }}
      className="on-dark m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 text-on-dark backdrop:bg-brown-950/80 motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-out-soft motion-safe:starting:open:translate-y-4 motion-safe:starting:open:opacity-0"
    >
      <div className="relative isolate grid max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-[calc(100vw-1.5rem)] max-w-sm grid-cols-1 gap-3 overflow-y-auto overscroll-contain rounded-lg bg-brown-950 p-3 shadow-card-hover ring-1 ring-primary/25 md:w-auto md:max-w-none md:grid-cols-[auto_17rem] md:grid-rows-[auto_1fr] md:gap-x-6 md:p-4">
        <span aria-hidden="true" className="mask-honeycomb-fade pointer-events-none absolute inset-0 -z-10 text-primary/10" />

        <div className="flex items-center justify-between gap-3 md:col-start-2 md:row-start-1">
          <p className="inline-flex items-center gap-2 ps-1 font-subtitle text-meta font-bold text-primary">
            <BeeIcon className="size-4" strokeWidth={1.75} />
            From the hive
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-on-dark/10 text-on-dark transition-colors duration-200 hover:bg-on-dark/20"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close video</span>
          </button>
        </div>

        {/* 9:16 frame for vertical Shorts. Phones: as wide as fits with the
            header, two lines of text and the button (about 18rem); desktop: up
            to 640px tall. */}
        <div className="relative mx-auto aspect-[9/16] w-[min(100%,calc((100dvh-18rem)*9/16))] overflow-hidden rounded-md bg-brown-900 md:col-start-1 md:row-span-2 md:row-start-1 md:h-[min(40rem,calc(100dvh-4rem))] md:w-auto">
          <BeeIcon aria-hidden="true" className="absolute top-1/2 left-1/2 size-10 -translate-1/2 text-primary/40" strokeWidth={1.25} />
          <iframe
            src={embed}
            title={`Video: ${popup.title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              revealTimer.current = setTimeout(() => setIsPlayerShown(true), PLAYER_SETTLE_MS);
            }}
            className={cx("relative size-full", !isPlayerShown && "invisible")}
          />
        </div>

        <div className="px-1 pb-1 md:col-start-2 md:row-start-2 md:self-end md:pb-2">
          <h2 id={titleId} className="font-heading text-promo font-semibold text-on-dark md:text-h3">
            {popup.title}
          </h2>
          {popup.subtitle && (
            <p className="mt-2 line-clamp-2 font-subtitle text-copy text-on-dark-muted md:mt-3 md:line-clamp-none">
              {popup.subtitle}
            </p>
          )}
          {hasCta && (
            <ButtonLink href={popup.ctaHref} onClick={close} className="mt-4 w-full md:mt-6">
              {popup.ctaLabel}
            </ButtonLink>
          )}
        </div>
      </div>
    </dialog>
  );
}
