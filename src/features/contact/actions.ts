"use server";

import { readFields, type FormState } from "@/lib/forms";
import { contactFields, validateContact, type ContactField } from "./validation";

/**
 * Contact form handler. There is no backend yet, so a valid message is
 * acknowledged without being stored or sent. Wire email/CRM delivery here,
 * and add rate limiting before it does anything with side effects.
 */
export async function sendContactMessage(
  _previous: FormState<ContactField>,
  formData: FormData,
): Promise<FormState<ContactField>> {
  const input = readFields(formData, contactFields);
  const result = validateContact(input);

  if (!result.ok) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: result.fieldErrors,
      values: input,
    };
  }

  const firstName = result.data.name.split(/\s+/)[0];
  return {
    status: "success",
    message: `Thanks, ${firstName}! Your message is with our team and we'll reply within one business day.`,
  };
}
