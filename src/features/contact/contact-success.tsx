"use client";

import Link from "next/link";
import type { Ref } from "react";
import { Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { topicPhrase } from "./contact-topics";
import type { ContactService } from "./validation";

/** What the visitor sent, kept in the browser to confirm it back to them. */
export type SentMessage = {
  name: string;
  email: string;
  phone: string;
  service: ContactService;
  message: string;
};

type ContactSuccessProps = {
  /** Null when the page was re-rendered by the server (no JavaScript). */
  sent: SentMessage | null;
  /** The Server Action's own confirmation, used without JavaScript. */
  fallbackMessage: string;
  headingRef: Ref<HTMLHeadingElement>;
  onSendAnother: () => void;
};

/** Replaces the form inside its card once the message is saved. */
export function ContactSuccess({ sent, fallbackMessage, headingRef, onSendAnother }: ContactSuccessProps) {
  const firstName = sent?.name.split(/\s+/)[0];
  const phrase = sent ? topicPhrase(sent.service) : null;

  return (
    <div role="status" className="pt-6 text-center sm:pt-4 sm:text-left">
      <div className="success-content">
        <span aria-hidden="true" className="hex-clip mx-auto flex size-16 items-center justify-center bg-primary text-strong sm:mx-0">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="mt-5 text-h2-sm font-semibold text-strong outline-none lg:text-h3">
          {firstName ? `Thank you, ${firstName}. Your message is with us.` : "Thank you. Your message is with us."}
        </h3>
        {sent ? (
          <div className="mx-auto mt-3 max-w-prose space-y-2 text-body sm:mx-0">
            <p>
              We&apos;ve received your message{phrase ? ` about ${phrase}` : ""} and will reply to{" "}
              <strong className="font-semibold [overflow-wrap:anywhere] text-strong">{sent.email}</strong> within one business day.
            </p>
            {sent.phone && (
              <p>
                We may also call or WhatsApp you on <strong className="font-semibold whitespace-nowrap text-strong">{sent.phone}</strong>.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-body">{fallbackMessage}</p>
        )}

        {sent && (
          <details className="group mt-6 rounded-md border border-border bg-ivory text-left">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 font-semibold text-strong">View your message</summary>
            <p className="border-t border-border p-4 whitespace-pre-wrap [overflow-wrap:anywhere]">{sent.message}</p>
          </details>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/shop" className={buttonClasses()}>
            Browse our honey
          </Link>
          <Link href="/track-order" className={buttonClasses({ variant: "outline" })}>
            Track an order
          </Link>
          <button
            type="button"
            onClick={onSendAnother}
            className="inline-flex min-h-11 items-center justify-center rounded-sm px-2 text-sm font-semibold text-primary-ink underline underline-offset-2 hover:no-underline sm:justify-start"
          >
            Send another message
          </button>
        </div>
      </div>
    </div>
  );
}
