"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { useActionState, useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode, type Ref } from "react";
import { CircleCheck, ChevronDown, Mail, Pencil, Phone, ShoppingBasket, TriangleAlert, User } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { UnavailableCartItems } from "@/features/cart/components/unavailable-cart-items";
import { cartActions, useCartLines } from "@/features/cart/cart-store";
import { partitionCartLines, priceCart, type CartProduct, type StockAdjustment } from "@/features/cart/pricing";
import { readFields, type FieldErrors } from "@/lib/forms";
import { formatPrice } from "@/lib/format";
import { useIsClient } from "@/lib/use-is-client";
import { cx } from "@/lib/cx";
import { placeOrder, type CheckoutState } from "./actions";
import { CheckoutHeader } from "./checkout-header";
import {
  CheckoutSummary,
  FreeDeliveryNudge,
  PlaceOrderButton,
  SummaryLines,
  SummaryTotals,
  TrustList,
  WhatsappNote,
  type CheckoutHelp,
} from "./checkout-summary";
import { adjustmentLine, errorSummaryTitle, orderedFieldErrors } from "./messages";
import { OrderConfirmation } from "./order-confirmation";
import { finishOrderWhatsappWindow, openOrderWhatsappWindow } from "./whatsapp-window";
import { DELIVERY_COUNTRY, checkoutFields, provinces, validateBilling, type CheckoutField } from "./validation";

const initialState: CheckoutState = { status: "idle" };
const NOTES_MAX = 500;
const COD_TILE_ID = "cod-tile";

// Clears the local cart only once the server has accepted the order, and
// applies any stock corrections the server reports (sold out / fewer left).
async function placeOrderAndClearCart(previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const result = await placeOrder(previous, formData);
  if (result.status === "success") cartActions.clear();
  if (result.status === "error") {
    for (const item of result.stockAdjustments ?? []) {
      if (item.available === 0) cartActions.remove(item.slug);
      else cartActions.setQuantity(item.slug, item.available);
    }
  }
  return result;
}

/** The element an error points at: the field itself, or the COD tile for the hidden payment field. */
function errorTargetId(field: Exclude<CheckoutField, "cart">): string {
  return field === "paymentMethod" ? COD_TILE_ID : field;
}

type CheckoutFormProps = {
  catalog: ReadonlyArray<CartProduct>;
  whatsappEnabled: boolean;
  help: CheckoutHelp;
};

export function CheckoutForm({ catalog, whatsappEnabled, help }: CheckoutFormProps) {
  const whatsappWindow = useRef<Window | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(async (previous: CheckoutState, formData: FormData) => {
    try {
      const result = await placeOrderAndClearCart(previous, formData);
      const popup = whatsappWindow.current;
      whatsappWindow.current = null;
      finishOrderWhatsappWindow(popup, result.status === "success" ? result.whatsappUrl : undefined);
      // Show phone shoppers what changed in their basket.
      if (result.status === "error" && result.stockAdjustments?.length) setSummaryOpen(true);
      return result;
    } catch (error) {
      const popup = whatsappWindow.current;
      whatsappWindow.current = null;
      finishOrderWhatsappWindow(popup);
      throw error;
    }
  }, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors<CheckoutField> | null>(null);
  const [notesLength, setNotesLength] = useState(0);
  const [payBarHidden, setPayBarHidden] = useState(false);
  const isClient = useIsClient();
  const lines = useCartLines();
  const totals = priceCart(lines, new Map(catalog.map((product) => [product.slug, product])));
  const { unavailable } = partitionCartLines(lines, new Set(catalog.map((product) => product.slug)));

  // After a server answer, move focus to what needs attention: the first
  // highlighted field, otherwise the notice explaining what happened.
  useEffect(() => {
    if (state.status !== "error") return;
    const first = orderedFieldErrors(state.fieldErrors)[0];
    const target = first ? document.getElementById(errorTargetId(first.field)) : null;
    (target ?? noticeRef.current)?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <CheckoutShell step="done">
        <OrderConfirmation state={state} />
      </CheckoutShell>
    );
  }

  if (!isClient) {
    return (
      <CheckoutShell step="details">
        <CheckoutSkeleton />
      </CheckoutShell>
    );
  }

  const serverErrors = state.status === "error" ? state.fieldErrors : {};
  const errors: FieldErrors<CheckoutField> = clientErrors ?? serverErrors;
  const values: Partial<Record<CheckoutField, string>> = state.status === "error" ? state.values : {};
  const fieldErrorList = orderedFieldErrors(errors);
  const stockAdjustments: StockAdjustment[] = state.status === "error" && !clientErrors ? state.stockAdjustments ?? [] : [];
  const serverMessage =
    state.status === "error" && !clientErrors && fieldErrorList.length === 0 && stockAdjustments.length === 0
      ? (errors.cart ?? state.message)
      : null;
  const highlighted = new Set(stockAdjustments.filter((item) => item.available > 0).map((item) => item.slug));
  const blocked = unavailable.length > 0;

  if (totals.lines.length === 0) {
    return (
      <CheckoutShell step="details">
        <div className="mx-auto max-w-2xl space-y-6">
          {stockAdjustments.length > 0 && <StockNotice ref={noticeRef} adjustments={stockAdjustments} emptied />}
          <UnavailableCartItems lines={unavailable} />
          <EmptyBasket hasUnavailable={unavailable.length > 0} />
        </div>
      </CheckoutShell>
    );
  }

  function focusErrorTarget(event: MouseEvent<HTMLAnchorElement>, field: Exclude<CheckoutField, "cart">) {
    const target = document.getElementById(errorTargetId(field));
    if (!target) return;
    event.preventDefault();
    target.focus();
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    if (blocked) {
      event.preventDefault();
      return;
    }
    const result = validateBilling(readFields(new FormData(event.currentTarget), checkoutFields));
    if (result.ok) {
      setClientErrors(null);
      if (whatsappEnabled && !isPending) {
        whatsappWindow.current = openOrderWhatsappWindow();
      }
      return;
    }
    event.preventDefault();
    // Render the error summary first, so focusing the field scrolls against
    // the final layout (otherwise the summary pushes it under the pay bar).
    flushSync(() => setClientErrors(result.fieldErrors));
    const first = orderedFieldErrors(result.fieldErrors)[0];
    if (first) document.getElementById(errorTargetId(first.field))?.focus();
  }

  // Hide the fixed phone bar while the in-page Review button is on screen or
  // scrolled past, so only one primary action is visible at a time.
  function observeReviewButton(node: HTMLDivElement | null) {
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setPayBarHidden(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }

  const notesRemaining = NOTES_MAX - notesLength;
  const buttonState = { total: totals.total, pending: isPending, blocked };

  return (
    <CheckoutShell step="details">
      <form
        action={formAction}
        onSubmit={validateBeforeSubmit}
        noValidate
        aria-busy={isPending || undefined}
        data-checkout=""
        className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_26.25rem] xl:gap-16"
      >
        <input type="hidden" name="cart" value={JSON.stringify(lines)} />

        <div className="min-w-0 space-y-5">
          <details
            open={summaryOpen}
            onToggle={(event) => setSummaryOpen(event.currentTarget.open)}
            className="group rounded-md border border-border bg-tile lg:hidden"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-md px-4 font-semibold text-strong [&::-webkit-details-marker]:hidden">
              <ShoppingBasket className="size-5 shrink-0 text-primary-ink" aria-hidden="true" />
              <span className="group-open:hidden">Show order summary</span>
              <span className="hidden group-open:inline">Hide order summary</span>
              <ChevronDown className="size-4 shrink-0 text-primary-ink group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-200" aria-hidden="true" />
              <span className="ml-auto font-heading tabular-nums">{formatPrice(totals.total)}</span>
            </summary>
            <div className="space-y-4 rounded-b-md border-t border-border bg-surface px-4 pt-3 pb-4">
              <SummaryLines totals={totals} highlighted={highlighted} />
              <Link href="/cart" className="-mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
                Edit basket
              </Link>
              <SummaryTotals totals={totals} />
              <FreeDeliveryNudge subtotal={totals.subtotal} />
            </div>
          </details>

          <div aria-live="polite" className="empty:hidden">
            {fieldErrorList.length > 0 && (
              <div className="rounded-md border border-danger/40 bg-danger/5 p-4">
                <p className="flex items-center gap-2 font-semibold text-danger">
                  <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                  {errorSummaryTitle(fieldErrorList.length)}
                </p>
                <ul className="mt-2 space-y-1.5 pl-6 text-sm">
                  {fieldErrorList.map(({ field, message }) => (
                    <li key={field}>
                      <a href={`#${errorTargetId(field)}`} onClick={(event) => focusErrorTarget(event, field)} className="text-danger underline underline-offset-2 hover:no-underline">
                        {message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {serverMessage && (
              <div ref={noticeRef} tabIndex={-1} className="rounded-md border border-danger/40 bg-danger/5 p-4 outline-offset-2">
                <p className="flex items-center gap-2 font-semibold text-danger">
                  <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                  We couldn&apos;t place your order
                </p>
                <p className="mt-1 text-sm text-strong">{serverMessage}</p>
                <p className="mt-1 text-sm text-body">
                  Your details are saved below, so you can try again. If it keeps happening:{" "}
                  <a href={help.href} {...(help.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
                    {help.label}
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
          {stockAdjustments.length > 0 && <StockNotice ref={noticeRef} adjustments={stockAdjustments} />}
          <UnavailableCartItems lines={unavailable} />

          <SectionCard number={1} id="contact" title="Contact" hint="We'll call you to confirm before we dispatch.">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="firstName" name="firstName" label="First name" autoComplete="given-name" autoCapitalize="words" icon={User} error={errors.firstName} defaultValue={values.firstName} />
              <TextField id="lastName" name="lastName" label="Last name" autoComplete="family-name" autoCapitalize="words" icon={User} error={errors.lastName} defaultValue={values.lastName} />
              <TextField
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                label="Mobile number"
                hint="The courier calls this number before delivery, e.g. 0300 1234567 or +92 300 1234567."
                placeholder="0300 1234567"
                autoComplete="tel"
                icon={Phone}
                error={errors.phone}
                defaultValue={values.phone}
                className="sm:col-span-2"
              />
              <TextField
                id="email"
                name="email"
                type="email"
                inputMode="email"
                label="Email address"
                optional
                hint="Only used for questions about this order."
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                icon={Mail}
                error={errors.email}
                defaultValue={values.email}
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          <SectionCard number={2} id="delivery" title="Delivery address" hint={`We deliver anywhere in ${DELIVERY_COUNTRY}.`}>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="street" name="street" label="House number and street" autoComplete="address-line1" error={errors.street} defaultValue={values.street} className="sm:col-span-2" />
              <TextField id="apartment" name="apartment" label="Area, block, sector or landmark" optional autoComplete="address-line2" error={errors.apartment} defaultValue={values.apartment} className="sm:col-span-2" />
              <TextField id="city" name="city" label="City" autoComplete="address-level2" autoCapitalize="words" error={errors.city} defaultValue={values.city} />
              <SelectField id="province" name="province" label="Province / territory" placeholder="Select province" autoComplete="address-level1" options={provinces} error={errors.province} defaultValue={values.province ?? ""} />
              <TextField
                id="postalCode"
                name="postalCode"
                label="Postal code"
                optional
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                autoComplete="postal-code"
                hint="5 digits, e.g. 54000. Leave it blank if you're not sure."
                error={errors.postalCode}
                defaultValue={values.postalCode}
              />
            </div>
          </SectionCard>

          <SectionCard number={3} id="payment" title="Payment">
            {/* Cash on delivery is the only method, so it is stated rather than offered as a choice. */}
            <input type="hidden" name="paymentMethod" value="cod" />
            <div
              id={COD_TILE_ID}
              tabIndex={-1}
              aria-describedby={errors.paymentMethod ? `${COD_TILE_ID}-error` : undefined}
              className={cx("flex gap-4 rounded-sm border-2 border-primary bg-primary-tint p-4", errors.paymentMethod && "border-danger")}
            >
              <CircleCheck className="mt-0.5 size-6 shrink-0 text-primary-ink" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="font-heading text-base font-semibold text-strong">Cash on delivery</p>
                <p className="mt-1 text-sm text-strong">Pay the courier in cash when your honey arrives. No card and no advance payment.</p>
                <p className="mt-1 text-meta text-body">Please keep the exact amount ready.</p>
              </div>
            </div>
            {errors.paymentMethod && <p id={`${COD_TILE_ID}-error`} className="mt-1.5 text-meta font-medium text-danger">{errors.paymentMethod}</p>}
          </SectionCard>

          <SectionCard number={4} id="notes-section" title="Order notes">
            <TextAreaField
              id="notes"
              name="notes"
              label="Note for us or the courier"
              optional
              icon={Pencil}
              rows={3}
              maxLength={NOTES_MAX}
              hint={`Directions for the courier, a gift message, or a good time to call. Up to ${NOTES_MAX} characters.`}
              error={errors.notes}
              defaultValue={values.notes}
              onChange={(event) => setNotesLength(event.currentTarget.value.length)}
            />
            <p className="mt-1.5 text-right text-meta text-muted tabular-nums" aria-live={notesRemaining <= 50 ? "polite" : "off"}>
              {notesLength}/{NOTES_MAX}
              {notesRemaining <= 50 && <span className="sr-only"> characters used, {notesRemaining} left</span>}
            </p>
          </SectionCard>

          <section aria-labelledby="review-heading" className="rounded-md border border-border bg-surface p-5 sm:p-7 lg:hidden">
            <h2 id="review-heading" className="font-heading text-h4 font-semibold text-strong sm:text-promo">Review and place order</h2>
            <div className="mt-4">
              <SummaryTotals totals={totals} />
            </div>
            <div className="mt-4">
              <FreeDeliveryNudge subtotal={totals.subtotal} />
            </div>
            <div ref={observeReviewButton} className="mt-5">
              <PlaceOrderButton id="place-order-review" {...buttonState} className="w-full" />
            </div>
            {whatsappEnabled && <WhatsappNote />}
            <div className="mt-5 border-t border-border pt-4">
              <TrustList help={help} />
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="summary-heading"
          className="hidden self-start rounded-md border border-border bg-surface p-6 lg:sticky lg:top-26 lg:block lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto"
        >
          <CheckoutSummary
            totals={totals}
            highlighted={highlighted}
            help={help}
            headingId="summary-heading"
            action={
              <div>
                <PlaceOrderButton id="place-order-aside" {...buttonState} className="w-full" />
                {whatsappEnabled && <WhatsappNote />}
              </div>
            }
          />
        </aside>

        <div
          data-checkout-bar=""
          inert={payBarHidden}
          className={cx(
            "on-dark fixed inset-x-0 bottom-0 z-30 bg-brown-950 pb-[env(safe-area-inset-bottom)] text-on-dark shadow-bar lg:hidden motion-safe:transition-transform motion-safe:duration-200",
            payBarHidden && "translate-y-full",
          )}
        >
          <div className="mx-auto flex max-w-page items-center gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="text-meta text-on-dark-muted">Total · cash on delivery</p>
              <p className="font-heading text-h4 font-semibold text-on-dark tabular-nums">{formatPrice(totals.total)}</p>
            </div>
            <div className="ml-auto text-right">
              <PlaceOrderButton id="place-order-bar" {...buttonState} showTotal={false} tone="dark" />
            </div>
          </div>
        </div>
      </form>
    </CheckoutShell>
  );
}

function CheckoutShell({ step, children }: { step: "details" | "done"; children: ReactNode }) {
  return (
    <>
      <CheckoutHeader step={step} />
      <Container className="pt-6 pb-8 lg:pt-10 lg:pb-12">{children}</Container>
    </>
  );
}

function SectionCard({ number, id, title, hint, children }: { number: number; id: string; title: string; hint?: string; children: ReactNode }) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className="rounded-md border border-border bg-surface p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-brown-950 font-sans text-sm font-semibold text-on-dark tabular-nums">
          {number}
        </span>
        <h2 id={headingId} className="font-heading text-h4 font-semibold text-strong sm:text-promo">
          <span className="sr-only">Step {number}: </span>
          {title}
        </h2>
      </div>
      {hint && <p className="mt-1 pl-11 text-meta text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StockNotice({ ref, adjustments, emptied = false }: { ref: Ref<HTMLDivElement>; adjustments: ReadonlyArray<StockAdjustment>; emptied?: boolean }) {
  return (
    <div ref={ref} role="status" tabIndex={-1} className="rounded-md border border-primary bg-primary-tint p-4 outline-offset-2">
      <p className="font-semibold text-strong">We&apos;ve updated your order</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-strong">
        {adjustments.map((item) => (
          <li key={item.slug}>{adjustmentLine(item)}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-body">
        {emptied ? "Nothing in your order is left in stock. Have a look at what's available today." : "Check your new total, then place your order again."}
      </p>
    </div>
  );
}

function EmptyBasket({ hasUnavailable }: { hasUnavailable: boolean }) {
  return (
    <div className="relative isolate overflow-hidden rounded-md border border-border bg-surface px-6 py-16 text-center">
      <span aria-hidden="true" className="mask-honeycomb-fade absolute inset-0 -z-10 text-primary/15" />
      <ShoppingBasket className="mx-auto size-12 text-primary-ink" strokeWidth={1.25} aria-hidden="true" />
      <h2 className="mt-4 font-heading text-h4 font-semibold text-strong sm:text-promo">
        {hasUnavailable ? "Nothing in your basket can be ordered right now" : "Your basket is empty"}
      </h2>
      <p className="mx-auto mt-2 max-w-sm">Add a jar or two of honey, then come back to check out.</p>
      <Link href="/shop" className={buttonClasses({ className: "mt-6" })}>
        Browse honey
      </Link>
    </div>
  );
}

/** Same footprint as the loaded form, so nothing jumps when the cart (localStorage) is read. */
function CheckoutSkeleton() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_26.25rem] xl:gap-16">
      <div className="space-y-5">
        <p role="status" className="sr-only">Loading checkout…</p>
        <div aria-hidden="true" className="h-14 rounded-md bg-tile motion-safe:animate-pulse lg:hidden" />
        <div aria-hidden="true" className="h-72 rounded-md bg-tile motion-safe:animate-pulse" />
        <div aria-hidden="true" className="h-80 rounded-md bg-tile motion-safe:animate-pulse" />
        <div aria-hidden="true" className="h-44 rounded-md bg-tile motion-safe:animate-pulse" />
      </div>
      <div aria-hidden="true" className="hidden h-128 rounded-md bg-tile motion-safe:animate-pulse lg:block" />
    </div>
  );
}
