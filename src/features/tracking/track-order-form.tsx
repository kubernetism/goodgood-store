"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { Hash, PackageSearch, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormStatus, TextField } from "@/components/ui/field";
import { readFields, type FieldErrors } from "@/lib/forms";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import { formatPktDateTime } from "@/lib/pk-time";
import { trackOrder, type TrackOrderState } from "./actions";
import type { TrackedOrder } from "./lookup";
import { trackingFields, validateTrackingInput, type TrackingField, type TrackingStep } from "./model";

const initialState: TrackOrderState = { status: "idle" };

/**
 * Order number + checkout phone in, the order's journey out. The phone stays
 * in the form only: it is never put in the URL or echoed back by the server.
 */
export function TrackOrderForm({ defaultOrder }: { defaultOrder: string }) {
  const [state, formAction, isPending] = useActionState(trackOrder, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors<TrackingField> | null>(null);
  // Controlled so a failed lookup does not wipe it; it stays in this browser tab only.
  const [phone, setPhone] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errors = clientErrors ?? (state.status === "error" ? state.fieldErrors : {});
  const orderValue = state.status === "error" ? state.values.order : state.status === "found" ? state.order.orderNumber : defaultOrder;

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (state.status === "found") resultHeading.current?.focus();
  }, [state]);

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateTrackingInput(readFields(new FormData(event.currentTarget), trackingFields));
    if (result.ok) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(result.fieldErrors);
    const first = trackingFields.find((field) => result.fieldErrors[field]);
    const element = first ? event.currentTarget.elements.namedItem(first) : null;
    if (element instanceof HTMLElement) element.focus();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <section aria-labelledby="track-form-heading" className="lg:col-span-5">
        <div className="rounded-lg border border-border bg-ivory p-6 sm:p-8">
          <h2 id="track-form-heading" className="font-heading text-h4 font-bold text-strong">Find your order</h2>
          <p className="mt-2 text-sm text-body">
            Enter the order number from your confirmation and the mobile number you used at checkout.
          </p>
          <form action={formAction} onSubmit={validateBeforeSubmit} noValidate className="mt-6 space-y-5">
            <div aria-live="polite" className="empty:hidden">
              {state.status === "error" && clientErrors === null && Object.keys(state.fieldErrors).length === 0 && (
                <FormStatus tone="error">{state.message}</FormStatus>
              )}
            </div>
            <TextField
              key={`order-${orderValue}`}
              id="track-order"
              name="order"
              label="Order number"
              placeholder="AS-1001"
              autoComplete="off"
              spellCheck={false}
              icon={Hash}
              maxLength={20}
              error={errors.order}
              defaultValue={orderValue}
            />
            <TextField
              id="track-phone"
              name="phone"
              type="tel"
              label="Mobile number"
              placeholder="0300 1234567"
              autoComplete="tel"
              inputMode="tel"
              icon={Phone}
              maxLength={25}
              error={errors.phone}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              hint="The number the courier calls, as entered at checkout."
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Looking up…" : "Track order"}
            </Button>
          </form>
          <p className="mt-5 text-meta text-muted">
            For your privacy we only show your order&apos;s progress and items, never your address or phone number.
          </p>
        </div>
      </section>

      <section aria-label="Order status" aria-live="polite" className="lg:col-span-7">
        {state.status === "found" ? (
          <TrackingResult order={state.order} headingRef={resultHeading} />
        ) : (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border-strong/50 bg-tile px-6 py-12 text-center">
            <PackageSearch className="size-12 text-primary-ink" strokeWidth={1.25} aria-hidden="true" />
            <p className="mt-4 font-heading text-lg font-bold text-strong">Your order&apos;s journey appears here</p>
            <p className="mt-2 max-w-sm text-sm text-body">From the moment we confirm it to the day it reaches your door.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function TrackingResult({ order, headingRef }: { order: TrackedOrder; headingRef: RefObject<HTMLHeadingElement | null> }) {
  const cancelled = order.cancellation !== null;
  const delivered = order.status === "delivered";
  return (
    <article className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <p className="font-subtitle text-eyebrow font-bold text-primary-ink uppercase">Order {order.orderNumber}</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1 font-heading text-h4 font-bold text-balance text-strong outline-none">
            Hi {order.firstName}, {order.hint.charAt(0).toLowerCase()}{order.hint.slice(1)}
          </h2>
          <p className="mt-1 text-meta text-muted">
            Placed {formatPktDateTime(order.placedAt)} · Delivering to {order.city}
          </p>
        </div>
        <span
          className={cx(
            "inline-flex min-h-8 items-center rounded-full px-4 text-meta font-semibold",
            cancelled ? "bg-danger/10 text-danger" : delivered ? "bg-strong text-on-dark" : "bg-primary text-strong",
          )}
        >
          {cancelled ? "Cancelled" : order.steps.find((step) => step.state === "current")?.label ?? "Delivered"}
        </span>
      </header>

      {cancelled && order.cancellation && (
        <div role="note" className="mt-5 rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-strong">
          <p className="font-semibold text-danger">
            Cancelled{order.cancellation.at ? ` on ${formatPktDateTime(order.cancellation.at)}` : ""}
          </p>
          <p className="mt-1">{order.cancellation.reason}</p>
        </div>
      )}

      <ol className="mt-6" aria-label="Order progress">
        {order.steps.map((step, index) => (
          <Step key={step.status} step={step} last={index === order.steps.length - 1} cancelled={cancelled} />
        ))}
      </ol>

      {order.courier && (
        <div className="mt-6 flex items-start gap-3 rounded-sm bg-primary-tint px-4 py-3 text-sm text-strong">
          <Truck className="mt-0.5 size-5 shrink-0 text-primary-ink" aria-hidden="true" />
          <p>
            {order.courier.name ? <>Sent with <strong>{order.courier.name}</strong></> : "Sent by courier"}
            {order.courier.trackingNumber && (
              <>
                {" "}· Tracking number <strong className="font-mono tracking-wide">{order.courier.trackingNumber}</strong>
              </>
            )}
          </p>
        </div>
      )}

      <h3 className="mt-8 font-heading text-base font-bold text-strong">Items</h3>
      <ul className="mt-2 divide-y divide-border">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
            <span className="min-w-0 text-strong">
              {item.name} <span className="text-muted">· {item.unit} × {item.quantity}</span>
            </span>
            <span className="tabular-nums text-strong">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
        <div className="flex justify-between gap-4 text-body"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
        <div className="flex justify-between gap-4 text-body"><dt>Delivery</dt><dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
        <div className="flex justify-between gap-4 font-semibold text-strong"><dt>{cancelled ? "Total" : delivered ? "Total paid on delivery" : "To pay on delivery"}</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
      </dl>
    </article>
  );
}

const HEX = "M12 1.5 21.5 7v10L12 22.5 2.5 17V7Z";

function Step({ step, last, cancelled }: { step: TrackingStep; last: boolean; cancelled: boolean }) {
  const reached = step.state !== "todo";
  return (
    <li className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 pb-5 last:pb-0" aria-current={step.state === "current" ? "step" : undefined}>
      {!last && (
        <span
          aria-hidden="true"
          className={cx("absolute top-8 bottom-0 left-[0.97rem] w-0.5", reached && !cancelled ? "bg-primary" : "bg-border")}
        />
      )}
      <svg viewBox="0 0 24 24" className="relative size-8" aria-hidden="true" focusable="false">
        <path
          d={HEX}
          className={cx(
            reached ? (cancelled ? "fill-border stroke-muted" : "fill-primary stroke-primary-ink") : "fill-surface stroke-border-strong",
            step.state === "current" && "motion-safe:animate-pulse",
          )}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {reached && step.state !== "current" && (
          <path d="m8 12.2 2.7 2.7L16.2 9.4" fill="none" className="stroke-strong" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {step.state === "current" && <circle cx="12" cy="12" r="3" className="fill-strong" />}
      </svg>
      <div className="min-w-0 pt-1">
        <p className={cx("text-sm font-semibold", reached ? "text-strong" : "text-muted")}>
          {step.label}
          {step.state === "current" && <span className="sr-only"> (current stage)</span>}
          {!reached && <span className="sr-only"> (not reached{cancelled ? "" : " yet"})</span>}
        </p>
        {step.at && <p className="text-meta text-muted">{formatPktDateTime(step.at)}</p>}
      </div>
    </li>
  );
}
