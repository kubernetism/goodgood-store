"use server";

import { readFields, type FormState } from "@/lib/forms";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { getClientIp, getClientIpHash } from "@/server/request";
import { CONTACT_RATE_LIMIT_MESSAGE, contactFields, validateContact, type ContactField } from "./validation";

/** Save validated enquiries for the admin team to review. */
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

  try {
    // Avoid treating all visitors without a forwarded IP as one client.
    const ipHash = await getClientIp() === "unknown" ? null : await getClientIpHash();
    if (ipHash) {
      const [recent] = await db.select({ value: count() }).from(contactMessages).where(and(
        eq(contactMessages.ipHash, ipHash),
        gt(contactMessages.createdAt, new Date(Date.now() - 10 * 60 * 1000)),
      ));
      if ((recent?.value ?? 0) >= 5) {
        return { status: "error", message: CONTACT_RATE_LIMIT_MESSAGE, fieldErrors: {}, values: input };
      }
    }
    await db.insert(contactMessages).values({ ...result.data, consent: true, ipHash });
  } catch {
    return { status: "error", message: "We couldn't send your message just now. Please try again or contact us by phone or email.", fieldErrors: {}, values: input };
  }

  const firstName = result.data.name.split(/\s+/)[0];
  return { status: "success", message: `Thanks, ${firstName}! Your message is with our team and we'll reply within one business day.` };
}
