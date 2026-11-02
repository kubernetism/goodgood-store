"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { HoneycombMark, HoneycombSparks } from "@/components/ui/honeycomb-mark";
import { CELEBRATION_MS, RISE_DELAYS } from "@/components/ui/honeycomb-geometry";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { cx } from "@/lib/cx";
import type { CheckoutState } from "./actions";
import { browserSession, initialCelebrationPhase, markCelebrated, type CelebrationPhase } from "./celebration";
import { DELIVERY_ESTIMATE, itemCountLabel } from "./messages";
import { formatPakistaniMobile } from "./validation";

type CopyStatus = "idle" | "copied" | "failed";

export function OrderConfirmation({ state }: { state: Extract<CheckoutState, { status: "success" }> }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const trackHref = `/track-order?order=${encodeURIComponent(state.orderNumber)}`;
  // Plays once per order; a remount for the same order shows the resting comb.
  const [celebration, setCelebration] = useState<CelebrationPhase>(() => initialCelebrationPhase(browserSession, state.orderNumber));

  // The form above is gone: start the reader (and screen reader) at the top of the receipt.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
    return () => clearTimeout(resetTimer.current);
  }, []);

  // Once it has played, settle on the resting comb so nothing replays when the
  // hidden route is shown again (Back after "Track this order").
  useEffect(() => {
    if (celebration !== "play") return;
    markCelebrated(browserSession, state.orderNumber);
    const timer = setTimeout(() => setCelebration("rest"), CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, [celebration, state.orderNumber]);
  const rise = (step: number) => ({ animationDelay: `${RISE_DELAYS[step]}s` });

  async function copyOrderNumber() {
    clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(state.orderNumber);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    resetTimer.current = setTimeout(() => setCopyStatus("idle"), 2500);
  }

  const steps = [
    <>
      We call <strong className="text-strong">{formatPakistaniMobile(state.phone)}</strong> to confirm your order ({siteConfig.contact.hours}; weekend orders are confirmed on Monday).
    </>,
    <>We pack your honey and hand it to the courier.</>,
    <>It arrives in {DELIVERY_ESTIMATE}. Pay the courier in cash.</>,
  ];

  return (
    <div data-celebrate={celebration} className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-border bg-surface">
      <div className="on-dark relative isolate overflow-hidden bg-brown-950 px-6 py-10 text-center text-on-dark sm:px-10">
        <span aria-hidden="true" className="mask-honeycomb-fade absolute inset-0 -z-10 text-primary/20" />
        {celebration === "play" && <HoneycombSparks />}
        <HoneycombMark variant="celebrate" playing={celebration === "play"} size={176} className="mx-auto size-36 sm:size-44" />
        <p className="hc-rise mt-5 font-script text-cta leading-none text-primary" style={rise(0)} aria-hidden="true">Thank you</p>
        <h2 ref={headingRef} tabIndex={-1} className="hc-rise mt-3 font-heading text-h2-sm font-semibold text-on-dark outline-none md:text-h3" style={rise(1)}>
          Thank you for your purchase
        </h2>

        <div className="hc-rise mt-6 flex flex-col items-center gap-3" style={rise(2)}>
          <p className="text-eyebrow font-semibold text-on-dark-muted uppercase">Order number</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="font-heading text-promo-lg font-semibold tracking-wide text-on-dark select-all">{state.orderNumber}</p>
            <button
              type="button"
              onClick={copyOrderNumber}
              aria-label={`Copy order number ${state.orderNumber}`}
              className={buttonClasses({ variant: "outline-dark", size: "sm", className: "min-h-11" })}
            >
              {copyStatus === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copyStatus === "copied" ? "Copied" : "Copy"}
            </button>
          </div>
          <p role="status" className={cx("text-meta", copyStatus === "failed" ? "text-on-dark" : "sr-only")}>
            {copyStatus === "copied" ? "Order number copied" : copyStatus === "failed" ? "Copying is blocked here. Select the number to copy it." : ""}
          </p>
        </div>

        <p className="hc-rise mt-5 text-copy text-on-dark" style={rise(3)}>
          Pay <strong className="text-primary tabular-nums">{formatPrice(state.total)}</strong> in cash on delivery · {itemCountLabel(state.itemCount)}
        </p>
      </div>

      <div className="hc-rise px-6 py-8 sm:px-10" style={rise(4)}>
        <h3 className="font-heading text-h4 font-semibold text-strong">What happens next</h3>
        <ol className="mt-4 space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-body">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-brown-950 font-sans text-sm font-semibold text-on-dark tabular-nums">
                {index + 1}
              </span>
              <span className="pt-1.5">{step}</span>
            </li>
          ))}
        </ol>

        {state.whatsappUrl && (
          <p className="mt-6 rounded-sm bg-primary-tint p-4 text-sm text-strong">
            Your order is already placed. Tap Send in WhatsApp to share the details with us. If WhatsApp didn&apos;t open, use the button below.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {state.whatsappUrl ? (
            <>
              <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses()}>
                Open order in WhatsApp
              </a>
              <Link href={trackHref} className={buttonClasses({ variant: "outline" })}>
                Track this order
              </Link>
              <Link href="/shop" className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
                Continue shopping
              </Link>
            </>
          ) : (
            <>
              <Link href={trackHref} className={buttonClasses()}>
                Track this order
              </Link>
              <Link href="/shop" className={buttonClasses({ variant: "outline" })}>
                Continue shopping
              </Link>
            </>
          )}
        </div>
        <p className="mt-4 text-meta text-muted">Keep your order number. You&apos;ll need it with your mobile number to track your order.</p>
      </div>
    </div>
  );
}
