"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import { Gift, MessageCircleQuestion, Send, Truck } from "lucide-react";
import { BeeIcon, HoneyJarIcon, type IconComponent } from "@/components/icons/honey-icons";
import { HoneyDrip } from "@/components/motifs/honey-drip";
import { buttonClasses } from "@/components/ui/button";
import { HoneycombMark } from "@/components/ui/honeycomb-mark";
import { TextAreaField, TextField } from "@/components/ui/field";
import { readFields, type FieldErrors, type FormState } from "@/lib/forms";
import { cx } from "@/lib/cx";
import { sendContactMessage } from "./actions";
import { ContactSuccess, type SentMessage } from "./contact-success";
import {
  contactTopics,
  messageCounterAnnouncement,
  messageCounterText,
  messageHintFor,
  parseContactService,
  topicAnchorId,
  topicFromHash,
} from "./contact-topics";
import {
  CONTACT_RATE_LIMIT_MESSAGE,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  contactFields,
  validateContact,
  validateContactField,
  type ContactField,
  type ContactService,
} from "./validation";

const initialState: FormState<ContactField> = { status: "idle" };

const topicIcons: Record<ContactService, IconComponent> = {
  "home-delivery": Truck,
  "bulk-orders": HoneyJarIcon,
  "gift-boxes": Gift,
  "farm-partnership": BeeIcon,
  other: MessageCircleQuestion,
};

/** Fields in the order they appear, for the error summary. */
const visualOrder: ReadonlyArray<ContactField> = ["service", "name", "email", "phone", "message", "consent"];

/** Where each error summary link sends focus. */
const fieldTargets: Record<ContactField, string> = {
  name: "contact-name",
  email: "contact-email",
  service: topicAnchorId(contactTopics[0]?.value ?? "other"),
  phone: "contact-phone",
  message: "contact-message",
  consent: "contact-consent",
};

type FocusTarget = "summary" | "success" | "topics";

type ContactFormProps = {
  /** Direct routes offered if sending fails. */
  whatsappHref: string | null;
  call: { href: string; display: string };
};

/**
 * Contact form. Fields check themselves as people leave them (and re-check
 * while an error is showing), a focused summary lists what to fix on submit,
 * and the Server Action re-validates as the source of truth. Without
 * JavaScript the same form posts to the action and the server re-renders.
 *
 * Submitting through onSubmit + startTransition (rather than letting React
 * run the form action) means React does not reset the form afterwards, so a
 * failed send keeps everything the visitor typed.
 */
export function ContactForm({ whatsappHref, call }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(sendContactMessage, initialState);
  const values: Partial<Record<ContactField, string>> = state.status === "error" ? state.values : {};

  const [errors, setErrors] = useState<FieldErrors<ContactField>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverNotice, setServerNotice] = useState<string | null>(null);
  const [topic, setTopic] = useState<ContactService | null>(() => parseContactService(values.service));
  const [messageLength, setMessageLength] = useState(() => values.message?.length ?? 0);
  const [sent, setSent] = useState<SentMessage | null>(null);
  const [dismissedState, setDismissedState] = useState<FormState<ContactField> | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ target: FocusTarget; id: number } | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLFieldSetElement>(null);

  const requestFocus = (target: FocusTarget) => setFocusRequest((previous) => ({ target, id: (previous?.id ?? 0) + 1 }));

  // Adopt each new result from the Server Action once (React's pattern for
  // adjusting state when an input changes, without an effect).
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") {
      setErrors(state.fieldErrors);
      setServerNotice(Object.keys(state.fieldErrors).length === 0 ? state.message : null);
      setAttempted(true);
      requestFocus("summary");
    } else if (state.status === "success") {
      requestFocus("success");
    }
  }

  const showSuccess = state.status === "success" && state !== dismissedState;

  // Move focus (and the viewport) to whatever just changed: the error
  // summary, the confirmation, or the topic picker after "Send another".
  useEffect(() => {
    if (!focusRequest) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (focusRequest.target === "summary") summaryRef.current?.focus();
    if (focusRequest.target === "success") {
      cardRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      successRef.current?.focus({ preventScroll: true });
    }
    if (focusRequest.target === "topics") topicsRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [focusRequest]);

  // Pathway cards link to "#enquiry-<topic>": choose that topic, bring the
  // picker into view and focus it. The hash is then cleared so the same
  // card works again after the visitor picks something else.
  useEffect(() => {
    function selectTopicFromHash() {
      const service = topicFromHash(window.location.hash);
      const radio = service ? document.getElementById(topicAnchorId(service)) : null;
      if (!service || !(radio instanceof HTMLInputElement)) return;
      radio.checked = true;
      setTopic(service);
      setErrors((current) => withoutError(current, "service"));
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      topicsRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      radio.focus({ preventScroll: true });
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    const initial = window.setTimeout(selectTopicFromHash, 0);
    window.addEventListener("hashchange", selectTopicFromHash);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("hashchange", selectTopicFromHash);
    };
  }, []);

  function setFieldError(field: ContactField, error: string | undefined) {
    setErrors((current) => (error ? { ...current, [field]: error } : withoutError(current, field)));
  }

  function fieldOf(target: EventTarget): { field: ContactField; value: string } | null {
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return null;
    const field = contactFields.find((name) => name === target.name);
    if (!field) return null;
    const value = target instanceof HTMLInputElement && target.type === "checkbox" ? (target.checked ? "on" : "") : target.value;
    return { field, value };
  }

  // Check a field when the visitor leaves it, but never nag about a field
  // they haven't touched yet (unless they already tried to send).
  function handleBlur(event: FocusEvent<HTMLFormElement>) {
    const changed = fieldOf(event.target);
    if (!changed || changed.field === "service" || changed.field === "consent") return;
    if (changed.value.trim() || attempted) setFieldError(changed.field, validateContactField(changed.field, changed.value));
  }

  // While an error shows, re-check on every change so it clears the moment it's fixed.
  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    const changed = fieldOf(event.target);
    if (!changed) return;
    if (changed.field === "service") {
      setTopic(parseContactService(changed.value));
      setFieldError("service", undefined);
      return;
    }
    if (changed.field === "message") setMessageLength(changed.value.length);
    if (errors[changed.field] || (changed.field === "consent" && attempted)) {
      setFieldError(changed.field, validateContactField(changed.field, changed.value));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    const input = readFields(formData, contactFields);
    const result = validateContact(input);
    setAttempted(true);
    setServerNotice(null);
    if (!result.ok) {
      setErrors(result.fieldErrors);
      requestFocus("summary");
      return;
    }
    setErrors({});
    setSent({ ...result.data, phone: input.phone });
    startTransition(() => formAction(formData));
  }

  function sendAnother() {
    setDismissedState(state);
    setSent(null);
    setTopic(null);
    setMessageLength(0);
    setAttempted(false);
    setErrors({});
    setServerNotice(null);
    requestFocus("topics");
  }

  const errorEntries = visualOrder.flatMap((field) => (errors[field] ? [{ field, message: errors[field] }] : []));
  const showSummary = errorEntries.length > 0 && attempted;
  const counterAnnouncement = messageCounterAnnouncement(messageLength, MESSAGE_MAX_LENGTH);
  const messageDescribedBy = `${errors.message ? "contact-message-error" : "contact-message-hint"} contact-message-count`;

  return (
    <div ref={cardRef} className="relative scroll-mt-28 overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-card sm:p-8 lg:p-10">
      {showSuccess ? (
        <>
          <HoneyDrip size="sm" className="success-drip absolute inset-x-0 top-0 text-primary" />
          <ContactSuccess
            sent={sent}
            fallbackMessage={state.status === "success" ? state.message : ""}
            headingRef={successRef}
            onSendAnother={sendAnother}
          />
        </>
      ) : (
        <form
          action={formAction}
          onSubmit={handleSubmit}
          onBlur={handleBlur}
          onChange={handleChange}
          noValidate
          aria-labelledby="message-heading"
        >
          {(showSummary || serverNotice) && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 scroll-mt-28 rounded-md border-2 border-danger bg-danger/5 p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              {showSummary ? (
                <>
                  <h3 className="font-subtitle text-h4 font-semibold text-danger">
                    Please fix {errorEntries.length === 1 ? "1 field" : `${errorEntries.length} fields`} to send your message
                  </h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-danger">
                    {errorEntries.map(({ field, message }) => (
                      <li key={field}>
                        <a
                          href={`#${fieldTargets[field]}`}
                          onClick={(event) => {
                            event.preventDefault();
                            const target = field === "service" && topic ? document.getElementById(topicAnchorId(topic)) : document.getElementById(fieldTargets[field]);
                            target?.focus();
                          }}
                          className="font-medium underline underline-offset-2 hover:no-underline"
                        >
                          {message}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : serverNotice === CONTACT_RATE_LIMIT_MESSAGE ? (
                <>
                  <h3 className="font-subtitle text-h4 font-semibold text-danger">Please wait a few minutes</h3>
                  <p className="mt-1 text-sm text-strong">{serverNotice}</p>
                </>
              ) : (
                <>
                  <h3 className="font-subtitle text-h4 font-semibold text-danger">We couldn&apos;t send your message just now</h3>
                  <p className="mt-1 text-sm text-strong">
                    Nothing you typed was lost. Try again, or reach us directly:{" "}
                    {whatsappHref && (
                      <>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-ink underline underline-offset-2">
                          WhatsApp us<span className="sr-only"> (opens WhatsApp)</span>
                        </a>{" "}
                        or{" "}
                      </>
                    )}
                    <a href={call.href} className="font-semibold whitespace-nowrap text-primary-ink underline underline-offset-2">
                      call {call.display}
                    </a>
                    .
                  </p>
                </>
              )}
            </div>
          )}

          <fieldset
            ref={topicsRef}
            id="contact-topic"
            aria-describedby={errors.service ? "contact-service-error" : undefined}
            className={cx(errors.service && "border-l-2 border-danger pl-3")}
          >
            <legend className="font-display text-meta font-semibold text-strong">What&apos;s your message about?</legend>
            {errors.service && (
              <p id="contact-service-error" className="mt-1.5 text-meta font-medium text-danger">
                {errors.service}
              </p>
            )}
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {contactTopics.map(({ value, label, description }) => {
                const Icon = topicIcons[value];
                return (
                  <label
                    key={value}
                    className={cx(
                      "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 transition-colors duration-150",
                      "hover:border-strong/50 hover:bg-ivory has-checked:border-strong has-checked:bg-primary-tint has-checked:shadow-[inset_0_0_0_1px_var(--color-strong)]",
                      "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                      value === "other" && "sm:col-span-2",
                    )}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={value}
                      id={topicAnchorId(value)}
                      required
                      defaultChecked={values.service === value}
                      className="peer sr-only"
                    />
                    <span aria-hidden="true" className="hex-clip flex size-9 shrink-0 items-center justify-center bg-tile text-primary-ink transition-colors duration-150 peer-checked:bg-primary peer-checked:text-strong">
                      <Icon className="size-[1.125rem]" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-strong">{label}</span>
                      <span className="hidden text-meta text-muted sm:block">{description}</span>
                    </span>
                    <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border-strong peer-checked:border-strong peer-checked:bg-primary [&>span]:scale-0 peer-checked:[&>span]:scale-100">
                      <span className="topic-indicator__dot size-2 rounded-full bg-strong" />
                    </span>
                  </label>
                );
              })}
            </div>
            {topic === "home-delivery" && (
              <p className="mt-3 flex gap-2 rounded-md bg-primary-tint px-4 py-3 text-meta text-strong">
                <Truck className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
                <span>
                  Have an order number? You can{" "}
                  <Link href="/track-order" className="font-semibold text-primary-ink underline underline-offset-2 hover:no-underline">
                    track your order
                  </Link>{" "}
                  instantly, or include the number in your message.
                </span>
              </p>
            )}
          </fieldset>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField
              id="contact-name"
              name="name"
              label="Your name"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              error={errors.name}
              defaultValue={values.name}
              className="sm:col-span-2"
            />
            <TextField
              id="contact-email"
              name="email"
              type="email"
              inputMode="email"
              label="Email address"
              hint="We'll reply here."
              autoComplete="email"
              error={errors.email}
              defaultValue={values.email}
            />
            <TextField
              id="contact-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              label="Mobile number"
              optional
              hint="Pakistani mobile, e.g. 0300 1234567. Add it if you'd like a call or WhatsApp back."
              autoComplete="tel"
              error={errors.phone}
              defaultValue={values.phone}
            />
          </div>

          <div className="mt-5">
            <TextAreaField
              id="contact-message"
              name="message"
              label="Your message"
              rows={6}
              maxLength={MESSAGE_MAX_LENGTH}
              error={errors.message}
              defaultValue={values.message}
              aria-describedby={messageDescribedBy}
              className="[&_textarea]:min-h-40 [&_textarea]:resize-y"
            />
            {/* Hint (left) and counter (right) share a row; the field's own error replaces the hint. */}
            <div className="mt-1.5 flex items-start justify-between gap-4 text-meta">
              {!errors.message && (
                <p id="contact-message-hint" className="text-muted">
                  {messageHintFor(topic)}
                </p>
              )}
              <p
                id="contact-message-count"
                className={cx(
                  "ml-auto shrink-0 text-right tabular-nums",
                  messageLength >= MESSAGE_MAX_LENGTH - 200 ? "font-semibold text-primary-ink" : "text-muted",
                )}
              >
                {messageCounterText(messageLength, MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH)}
              </p>
            </div>
            <p aria-live="polite" className="sr-only">
              {counterAnnouncement}
            </p>
          </div>

          <div className="mt-5">
            <label className="flex min-h-11 items-start gap-3 text-sm text-strong">
              <input
                id="contact-consent"
                type="checkbox"
                name="consent"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? "contact-consent-error" : undefined}
                defaultChecked={values.consent === "on"}
                className={cx("mt-0.5 size-5 shrink-0 cursor-pointer accent-strong", errors.consent && "outline-2 outline-danger")}
              />
              <span className="pt-px">
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

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              aria-disabled={isPending || undefined}
              className={buttonClasses({ className: cx("min-w-48", isPending && "cursor-progress opacity-80") })}
            >
              {isPending ? (
                <HoneycombMark tone="ink" size={24} />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {isPending ? "Sending…" : "Send message"}
            </button>
            <p className="text-meta text-muted">We reply within one business day.</p>
          </div>
          <p aria-live="polite" className="sr-only">
            {isPending ? "Sending your message" : ""}
          </p>
        </form>
      )}
    </div>
  );
}

function withoutError(errors: FieldErrors<ContactField>, field: ContactField): FieldErrors<ContactField> {
  if (!(field in errors)) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}
