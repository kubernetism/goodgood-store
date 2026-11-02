"use client";

import { useActionState, useId, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { HoneycombMark } from "@/components/ui/honeycomb-mark";
import { isEmail, type FormState } from "@/lib/forms";
import { cx } from "@/lib/cx";
import { subscribeToNewsletter, type NewsletterField } from "./actions";
import type { NewsletterSource } from "./sources";

const initialState: FormState<NewsletterField> = { status: "idle" };

type NewsletterFormProps = {
  /** `compact`: input + square send icon (footer). `wide`: input + SUBSCRIBE (bands). */
  variant?: "compact" | "wide";
  tone?: "light" | "dark";
  /** Recorded with the sign-up so the owner knows which form people use. */
  source?: NewsletterSource;
};

export function NewsletterForm({ variant = "compact", tone = "light", source = "footer" }: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const id = useId();
  const inputId = `${id}-email`;
  const messageId = `${id}-message`;

  const error = clientError ?? (state.status === "error" ? (state.fieldErrors.email ?? state.message) : undefined);

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email !== "string" || !isEmail(email.trim())) {
      event.preventDefault();
      setClientError("Enter an email address like name@example.com.");
      event.currentTarget.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    setClientError(null);
  }

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate className="w-full">
      <input type="hidden" name="source" value={source} />
      <div className={cx("flex", variant === "wide" ? "flex-col gap-3 sm:flex-row sm:gap-0" : "")}>
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="Email*"
          defaultValue={state.status === "error" ? state.values.email : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={cx(
            "min-w-0 flex-1 bg-surface px-5 text-sm text-strong placeholder:text-muted",
            variant === "wide" ? "h-13 rounded-sm sm:rounded-r-none" : "h-14 rounded-l-sm",
            error ? "border-2 border-danger" : "border border-transparent",
          )}
        />
        {variant === "wide" ? (
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-sm bg-primary px-10 text-button font-semibold text-strong uppercase transition-colors duration-200 hover:bg-primary-hover disabled:opacity-60 sm:rounded-l-none"
          >
            {isPending && <HoneycombMark tone="ink" size={22} />}
            {isPending ? "Subscribing…" : "Subscribe"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="flex size-14 shrink-0 items-center justify-center rounded-r-sm bg-primary text-strong transition-colors duration-200 hover:bg-primary-hover disabled:opacity-60"
          >
            {isPending ? <HoneycombMark tone="ink" size={24} /> : <Send className="size-5" aria-hidden="true" />}
            <span className="sr-only">{isPending ? "Subscribing" : "Subscribe"}</span>
          </button>
        )}
      </div>
      <p
        id={messageId}
        aria-live="polite"
        className={cx(
          "mt-2 min-h-5 text-meta",
          error
            ? tone === "dark"
              ? "font-semibold text-on-dark"
              : "text-danger"
            : tone === "dark"
              ? "text-primary"
              : "text-primary-ink",
        )}
      >
        {error ?? (state.status === "success" ? state.message : "")}
      </p>
    </form>
  );
}
