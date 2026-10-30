"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Mail, Pencil, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormStatus, SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { readFields, type FieldErrors, type FormState } from "@/lib/forms";
import { cx } from "@/lib/cx";
import { sendContactMessage } from "./actions";
import { contactFields, contactServices, validateContact, type ContactField } from "./validation";

const initialState: FormState<ContactField> = { status: "idle" };

/**
 * "Get A Quote" form. Validates in the browser for instant feedback, then the
 * Server Action re-validates (it is a public endpoint and the source of truth).
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContactMessage, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors<ContactField> | null>(null);

  const errors: FieldErrors<ContactField> = clientErrors ?? (state.status === "error" ? state.fieldErrors : {});
  const values: Partial<Record<ContactField, string>> = state.status === "error" ? state.values : {};
  const errorCount = Object.keys(errors).length;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateContact(readFields(new FormData(event.currentTarget), contactFields));
    if (result.ok) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(result.fieldErrors);
    const firstInvalid = contactFields.find((field) => result.fieldErrors[field]);
    const element = firstInvalid ? event.currentTarget.elements.namedItem(firstInvalid) : null;
    if (element instanceof HTMLElement) element.focus();
  }

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate className="space-y-5">
      <div aria-live="polite" className="empty:hidden">
        {state.status === "success" && clientErrors === null && <FormStatus tone="success">{state.message}</FormStatus>}
        {state.status === "error" && clientErrors === null && errorCount === 0 && <FormStatus tone="error">{state.message}</FormStatus>}
        {errorCount > 0 && (
          <FormStatus tone="error">
            Please fix {errorCount === 1 ? "1 field" : `${errorCount} fields`} below and try again.
          </FormStatus>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="contact-name" name="name" label="Your name" autoComplete="name" icon={User} maxLength={80} error={errors.name} defaultValue={values.name} />
        <TextField id="contact-email" name="email" type="email" label="Email address" autoComplete="email" icon={Mail} error={errors.email} defaultValue={values.email} />
        <SelectField id="contact-service" name="service" label="Service" placeholder="Select the service" options={contactServices} error={errors.service} defaultValue={values.service ?? ""} />
        <TextField id="contact-phone" name="phone" type="tel" label="Mobile number" optional autoComplete="tel" icon={Phone} error={errors.phone} defaultValue={values.phone} />
      </div>

      <TextAreaField id="contact-message" name="message" label="Message" icon={Pencil} rows={6} maxLength={2000} error={errors.message} defaultValue={values.message} />

      <div>
        <label className="flex items-start gap-3 text-sm text-strong">
          <input
            type="checkbox"
            name="consent"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "contact-consent-error" : undefined}
            defaultChecked={values.consent === "on"}
            className={cx("mt-0.5 size-5 shrink-0 accent-primary-ink", errors.consent && "outline-2 outline-danger")}
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy" className="font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
              privacy policy
            </Link>{" "}
            and to being contacted about my enquiry.
          </span>
        </label>
        {errors.consent && (
          <p id="contact-consent-error" className="mt-1.5 text-meta font-medium text-danger">
            {errors.consent}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Get a free quote"}
      </Button>
    </form>
  );
}
