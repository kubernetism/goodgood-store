"use server";

import { isEmail, readFields, type FormState } from "@/lib/forms";

export type NewsletterField = "email";

/**
 * Newsletter sign-up. No email provider is connected yet, so a valid address is
 * acknowledged but not stored. Connect the provider (and rate limiting) here.
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

  return { status: "success", message: "You're subscribed! Look out for our next fresh-picks email." };
}
