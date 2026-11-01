"use client";

import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { createSeenStore } from "@/features/banners/popup-frequency";
import type { VideoPopupContent, VideoPopupProps } from "./video-popup";

// The dialog's code is fetched only when it is about to open. React.lazy (not
// next/dynamic) because it adds no wrapper code to the page bundle, and the
// pop-up is never rendered on the server anyway (it starts closed). A failed
// chunk load (offline, deploy skew) renders nothing instead of throwing into
// the page's error boundary: an ad must never take the landing page down.
const VideoPopup = lazy<ComponentType<VideoPopupProps>>(() =>
  import("./video-popup").then(
    (module) => ({ default: module.VideoPopup }),
    (error: unknown) => {
      console.error("Video pop-up failed to load", error);
      return { default: PopupUnavailable };
    },
  ),
);

function PopupUnavailable(): null {
  return null;
}

const seen = createSeenStore(() => window.sessionStorage);

/** Time on the page after `load` before the pop-up opens. */
const OPEN_DELAY_MS = 4000;
/** While the tab is hidden or another dialog is open, check again after this. */
const RETRY_MS = 2000;

/**
 * Opens the landing-page video pop-up once per visit, a few seconds after the
 * page has loaded. A timer (not the first scroll or tap) keeps it out of the
 * visitor's first interaction, so it never adds to INP or interrupts a
 * gesture, and it starts after `load`, so it does not compete with the LCP.
 */
export function VideoPopupTrigger({ popup }: { popup: VideoPopupContent }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (seen.hasSeen(popup.id)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attempt = () => {
      // Never stack on the menu drawer or the story video, and wait for a visible tab.
      if (document.visibilityState !== "visible" || document.querySelector("dialog[open]")) {
        timer = setTimeout(attempt, RETRY_MS);
        return;
      }
      seen.markSeen(popup.id);
      setIsOpen(true);
    };
    const start = () => {
      timer = setTimeout(attempt, OPEN_DELAY_MS);
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      clearTimeout(timer);
    };
  }, [popup.id]);

  if (!isOpen) return null;
  return (
    <Suspense fallback={null}>
      <VideoPopup popup={popup} onClosed={() => setIsOpen(false)} />
    </Suspense>
  );
}
