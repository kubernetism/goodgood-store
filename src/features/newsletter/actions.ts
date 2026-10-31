"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";
import { isEmail, readFields, type FormState } from "@/lib/forms";
import { getClientIp, getClientIpHash } from "@/server/request";
import { newsletterSource } from "./sources";

export type NewsletterField = "email";

/** Sign-ups allowed per client IP per window (stops a script filling the list). */
const MAX_SIGNUPS_PER_WINDOW = 5;
const SIGNUP_WINDOW_MS = 10 * 60 * 1000;
const SUCCESS = "You're subscribed! Look out for our next fresh-picks email.";

/**
 * Newsletter sign-up. Stores the address lower-cased; a repeat sign-up is a
 * no-op that still reports success, so the form never reveals who is on the
 * list. No email provider is connected yet: the owner exports the list from
 * Admin -> Subscribers.
 */
export async function subscribeToNewsletter(
  _previous: FormState<NewsletterField>,
  formData: FormData,
): Promise<FormState<NewsletterField>> {
  const { email } = readFields(formData, ["email"] as const);

  if (!isEmail(email)) {
    return {
      status: "error",
      message: "Enter an email address like name@example.com.",
      fieldErrors: { email: "Enter an email address like name@example.com." },
      values: { email },
    };
  }

  try {
    // Without a forwarded IP every visitor would share one bucket, so the limit is skipped (as for contact).
    const ipHash = await getClientIp() === "unknown" ? null : await getClientIpHash();
    if (ipHash) {
      const [recent] = await db.select({ value: count() }).from(newsletterSubscribers).where(and(
        eq(newsletterSubscribers.ipHash, ipHash),
        gt(newsletterSubscribers.createdAt, new Date(Date.now() - SIGNUP_WINDOW_MS)),
      ));
      if ((recent?.value ?? 0) >= MAX_SIGNUPS_PER_WINDOW) {
        return { status: "error", message: "Too many sign-ups from here in a few minutes. Please try again later.", fieldErrors: {}, values: { email } };
      }
    }
    await db
      .insert(newsletterSubscribers)
      .values({ email: email.toLowerCase(), source: newsletterSource(formData.get("source")), ipHash })
      .onConflictDoNothing({ target: newsletterSubscribers.email });
  } catch (cause) {
    console.error("Newsletter sign-up failed", cause);
    return { status: "error", message: "We couldn't subscribe you just now. Please try again in a moment.", fieldErrors: {}, values: { email } };
  }

  return { status: "success", message: SUCCESS };
}
