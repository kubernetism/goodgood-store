"use client";

import { StarLink } from "@/components/ui/star-controls";
import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Banknote, CircleCheck, Mail, Pencil, Phone, ShoppingBasket, User } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { FormStatus, SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { cartActions, useCartLines } from "@/features/cart/cart-store";
import { priceCart, type CartProduct } from "@/features/cart/pricing";
import { readFields, type FieldErrors } from "@/lib/forms";
import { formatPrice } from "@/lib/format";
import { useIsClient } from "@/lib/use-is-client";
import { cx } from "@/lib/cx";
import { placeOrder, type CheckoutState } from "./actions";
import {
  DELIVERY_COUNTRY,
  checkoutFields,
  formatPakistaniMobile,
  provinces,
  validateBilling,
  type CheckoutField,
} from "./validation";

const initialState: CheckoutState = { status: "idle" };

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

export function CheckoutForm({ catalog }: { catalog: ReadonlyArray<CartProduct> }) {
  const [state, formAction, isPending] = useActionState(placeOrderAndClearCart, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors<CheckoutField> | null>(null);
  const isClient = useIsClient();
  const lines = useCartLines();
  const totals = priceCart(lines, new Map(catalog.map((product) => [product.slug, product])));

  if (state.status === "success") return <OrderConfirmation state={state} />;

  if (!isClient) {
    return <div aria-busy="true" aria-label="Loading checkout" className="h-96 animate-pulse rounded-sm bg-tile" />;
  }

  if (totals.lines.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-dashed border-border-strong/50 px-6 py-16 text-center">
        <ShoppingBasket className="size-12 text-primary-ink" strokeWidth={1.25} aria-hidden="true" />
        <h2 className="mt-4 text-h4 font-semibold">Your cart is empty</h2>
        <p className="mt-2 max-w-sm">Add a few products before checking out.</p>
        <StarLink href="/shop" className={buttonClasses({ className: "mt-6" })}>
          Browse the shop
        </StarLink>
      </div>
    );
  }

  const serverErrors = state.status === "error" ? state.fieldErrors : {};
  const errors: FieldErrors<CheckoutField> = clientErrors ?? serverErrors;
  const values: Partial<Record<CheckoutField, string>> = state.status === "error" ? state.values : {};

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateBilling(readFields(new FormData(event.currentTarget), checkoutFields));
    if (result.ok) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(result.fieldErrors);
    const firstInvalid = checkoutFields.find((field) => result.fieldErrors[field]);
    if (firstInvalid) {
      const element = event.currentTarget.elements.namedItem(firstInvalid);
      const target = element instanceof RadioNodeList ? element[0] : element;
      if (target instanceof HTMLElement) target.focus();
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate className="space-y-12">
      <input type="hidden" name="cart" value={JSON.stringify(lines)} />

      <div aria-live="polite">
        {errorCount > 0 ? (
          <FormStatus tone="error">
            {errors.cart ?? `Please fix ${errorCount === 1 ? "1 field" : `${errorCount} fields`} below to place your order.`}
          </FormStatus>
        ) : (
          state.status === "error" && <FormStatus tone="error">{state.message}</FormStatus>
        )}
      </div>

      <section aria-labelledby="billing-heading">
        <h2 id="billing-heading" className="text-promo font-semibold">
          Billing Details
        </h2>

        <fieldset className="mt-6">
          <legend className="font-display text-sm font-semibold text-strong">Personal Information</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <TextField id="firstName" name="firstName" label="First name" autoComplete="given-name" icon={User} error={errors.firstName} defaultValue={values.firstName} />
            <TextField id="lastName" name="lastName" label="Last name" autoComplete="family-name" icon={User} error={errors.lastName} defaultValue={values.lastName} />
            <TextField id="phone" name="phone" type="tel" inputMode="tel" label="Mobile number" hint="The courier calls this number before delivery, e.g. 0300 1234567." autoComplete="tel" icon={Phone} error={errors.phone} defaultValue={values.phone} />
            <TextField id="email" name="email" type="email" label="Email address" optional autoComplete="email" icon={Mail} error={errors.email} defaultValue={values.email} />
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="font-display text-sm font-semibold text-strong">Delivery Address</legend>
          <p className="mt-1 text-meta">We deliver across {DELIVERY_COUNTRY} only.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-6">
            <TextField id="street" name="street" label="House number and street" autoComplete="address-line1" error={errors.street} defaultValue={values.street} className="sm:col-span-3" />
            <TextField id="apartment" name="apartment" label="Area, block, sector or landmark" optional autoComplete="address-line2" error={errors.apartment} defaultValue={values.apartment} className="sm:col-span-3" />
            <TextField id="city" name="city" label="City" autoComplete="address-level2" error={errors.city} defaultValue={values.city} className="sm:col-span-2" />
            <SelectField id="province" name="province" label="Province / territory" placeholder="Select province" autoComplete="address-level1" options={provinces} error={errors.province} defaultValue={values.province ?? ""} className="sm:col-span-2" />
            <TextField id="postalCode" name="postalCode" label="Postal code" optional inputMode="numeric" maxLength={5} autoComplete="postal-code" error={errors.postalCode} defaultValue={values.postalCode} className="sm:col-span-2" />
          </div>
        </fieldset>

        <TextAreaField id="notes" name="notes" label="Order notes" optional icon={Pencil} maxLength={500} placeholder="Notes about your order, e.g. special notes for delivery." error={errors.notes} defaultValue={values.notes} className="mt-8" />
      </section>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-promo font-semibold">
            Payment Method
          </h2>
          {/* Cash on delivery is the only method, so it is stated rather than offered as a choice. */}
          <input type="hidden" name="paymentMethod" value="cod" />
          <div
            className={cx(
              "mt-6 flex items-start gap-4 rounded-sm border border-primary bg-primary-tint p-4",
              errors.paymentMethod && "border-danger",
            )}
          >
            <Banknote className="mt-0.5 size-6 shrink-0 text-primary-ink" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-sm font-semibold text-strong">Cash on delivery</p>
              <p className="mt-1 text-meta">Pay the courier in cash when your honey arrives. No card details needed.</p>
            </div>
          </div>
          {errors.paymentMethod && <p className="mt-1.5 text-meta font-medium text-danger">{errors.paymentMethod}</p>}
          <Button type="submit" disabled={isPending} className="mt-6 w-full sm:w-auto">
            {isPending ? "Placing order…" : "Place order"}
          </Button>
        </section>

        <section aria-labelledby="order-total-heading">
          <h2 id="order-total-heading" className="text-promo font-semibold">
            Cart Total
          </h2>
          <div className="mt-6">
            <OrderSummary totals={totals} showLines />
          </div>
          <Link href="/cart" className="mt-4 inline-block text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
            Edit cart
          </Link>
        </section>
      </div>
    </form>
  );
}

function OrderConfirmation({ state }: { state: Extract<CheckoutState, { status: "success" }> }) {
  return (
    <div role="status" className="flex flex-col items-center rounded-md border border-primary/50 bg-primary-tint px-6 py-16 text-center">
      <CircleCheck className="size-14 text-primary-ink" strokeWidth={1.25} aria-hidden="true" />
      <h2 className="mt-4 text-h3 font-semibold">Thank you for your order!</h2>
      <p className="mt-3 max-w-md text-strong">
        Order <strong>#{state.orderNumber}</strong> for {state.itemCount === 1 ? "1 item" : `${state.itemCount} items`} totalling{" "}
        <strong>{formatPrice(state.total)}</strong> has been received. We&apos;ll call{" "}
        <strong>{formatPakistaniMobile(state.phone)}</strong> to confirm it before dispatch.
      </p>
      <p className="mt-2 text-meta">Please keep the exact amount ready: you pay in cash on delivery.</p>
      <StarLink href="/shop" className={buttonClasses({ className: "mt-8" })}>
        Continue shopping
      </StarLink>
    </div>
  );
}
