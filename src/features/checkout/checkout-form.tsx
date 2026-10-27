"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { CircleCheck, Globe, Mail, Pencil, Phone, ShoppingBasket, User } from "lucide-react";
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
import { checkoutFields, countries, paymentMethods, validateBilling, type CheckoutField } from "./validation";

const initialState: CheckoutState = { status: "idle" };

// Clears the local cart only once the server has accepted the order.
async function placeOrderAndClearCart(previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const result = await placeOrder(previous, formData);
  if (result.status === "success") cartActions.clear();
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
        <Link href="/shop" className={buttonClasses({ className: "mt-6" })}>
          Browse the shop
        </Link>
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
        {errorCount > 0 && (
          <FormStatus tone="error">
            {errors.cart ?? `Please fix ${errorCount === 1 ? "1 field" : `${errorCount} fields`} below to place your order.`}
          </FormStatus>
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
            <TextField id="company" name="company" label="Company name" optional autoComplete="organization" icon={Globe} defaultValue={values.company} />
            <TextField id="phone" name="phone" type="tel" label="Phone number" autoComplete="tel" icon={Phone} error={errors.phone} defaultValue={values.phone} />
            <TextField id="email" name="email" type="email" label="Email address" autoComplete="email" icon={Mail} error={errors.email} defaultValue={values.email} className="sm:col-span-2" />
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="font-display text-sm font-semibold text-strong">Shipping Address</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-6">
            <SelectField id="country" name="country" label="Country" placeholder="Select country" autoComplete="country" options={countries} error={errors.country} defaultValue={values.country ?? "US"} className="sm:col-span-3" />
            <div className="hidden sm:col-span-3 sm:block" />
            <TextField id="street" name="street" label="House number and street name" autoComplete="address-line1" error={errors.street} defaultValue={values.street} className="sm:col-span-3" />
            <TextField id="apartment" name="apartment" label="Apartment, suite, unit" optional autoComplete="address-line2" defaultValue={values.apartment} className="sm:col-span-3" />
            <TextField id="city" name="city" label="Town / City" autoComplete="address-level2" error={errors.city} defaultValue={values.city} className="sm:col-span-2" />
            <TextField id="state" name="state" label="State" autoComplete="address-level1" error={errors.state} defaultValue={values.state} className="sm:col-span-2" />
            <TextField id="zip" name="zip" label="ZIP / Postcode" autoComplete="postal-code" error={errors.zip} defaultValue={values.zip} className="sm:col-span-2" />
          </div>
        </fieldset>

        <TextAreaField id="notes" name="notes" label="Order notes" optional icon={Pencil} maxLength={500} placeholder="Notes about your order, e.g. special notes for delivery." error={errors.notes} defaultValue={values.notes} className="mt-8" />
      </section>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-promo font-semibold">
            Payment Method
          </h2>
          <fieldset
            className="mt-6 space-y-3 rounded-sm border border-border p-3"
            aria-describedby={errors.paymentMethod ? "paymentMethod-error" : undefined}
          >
            <legend className="sr-only">Choose a payment method</legend>
            {paymentMethods.map((method) => (
              <label
                key={method.value}
                className={cx(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border px-4 font-display text-sm font-semibold text-strong transition-colors duration-200 has-checked:border-primary has-checked:bg-primary-tint",
                  errors.paymentMethod ? "border-danger" : "border-border-strong/40 hover:border-strong",
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  defaultChecked={values.paymentMethod === method.value}
                  className="size-4 accent-primary-ink"
                />
                {method.label}
              </label>
            ))}
          </fieldset>
          {errors.paymentMethod && (
            <p id="paymentMethod-error" className="mt-1.5 text-meta font-medium text-danger">
              {errors.paymentMethod}
            </p>
          )}
          <p className="mt-3 text-meta">This is a demo store: no payment will be taken.</p>
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
        <strong>{formatPrice(state.total)}</strong> has been received. We&apos;ll email updates to{" "}
        <strong>{state.email}</strong>.
      </p>
      <p className="mt-2 text-meta">Demo store: no payment was taken and no email will be sent.</p>
      <Link href="/shop" className={buttonClasses({ className: "mt-8" })}>
        Continue shopping
      </Link>
    </div>
  );
}
