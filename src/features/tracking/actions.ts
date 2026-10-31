"use server";

import { and, count, eq, gt, lt } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db/client";
import { orderLookupAttempts } from "@/db/schema";
import { readFields, type FieldErrors } from "@/lib/forms";
import { getClientIp, getClientIpHash } from "@/server/request";
import { findTrackedOrder, type TrackedOrder } from "./lookup";
import { TRACKING_NOT_FOUND, trackingFields, validateTrackingInput, type TrackingField } from "./model";

export type TrackOrderState =
  | { status: "idle" }
  | { status: "found"; order: TrackedOrder }
  | { status: "error"; message: string; fieldErrors: FieldErrors<TrackingField>; values: { order: string } };

/** Lookups allowed per client IP per window: enough for typos, too few to guess phone numbers. */
const MAX_LOOKUPS_PER_WINDOW = 10;
const LOOKUP_WINDOW_MS = 10 * 60 * 1000;
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Public "Track your order" lookup. Needs the order number and the phone used
 * at checkout; a wrong number and a wrong phone get the same answer. Never
 * cached: the result is request-time data for this visitor only. The phone
 * is not echoed back, so it never reaches the URL or the page HTML.
 */
export async function trackOrder(_previous: TrackOrderState, formData: FormData): Promise<TrackOrderState> {
  const input = readFields(formData, trackingFields);
  const values = { order: input.order };
  const parsed = validateTrackingInput(input);
  if (!parsed.ok) return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.fieldErrors, values };

  try {
    // Without a forwarded IP every visitor would share one bucket, so the limit is skipped (as for contact and checkout).
    const ipHash = await getClientIp() === "unknown" ? null : await getClientIpHash();
    if (ipHash) {
      const [recent] = await db.select({ value: count() }).from(orderLookupAttempts).where(and(
        eq(orderLookupAttempts.ipHash, ipHash),
        gt(orderLookupAttempts.createdAt, new Date(Date.now() - LOOKUP_WINDOW_MS)),
      ));
      if ((recent?.value ?? 0) >= MAX_LOOKUPS_PER_WINDOW) {
        return { status: "error", message: "Too many lookups in a few minutes. Please wait a little and try again, or call us.", fieldErrors: {}, values };
      }
      await db.insert(orderLookupAttempts).values({ ipHash });
      after(async () => {
        try {
          await db.delete(orderLookupAttempts).where(lt(orderLookupAttempts.createdAt, new Date(Date.now() - ATTEMPT_RETENTION_MS)));
        } catch (cause) { console.error("Pruning order lookup attempts failed", cause); }
      });
    }
    const order = await findTrackedOrder(parsed.data.number, parsed.data.phone);
    if (!order) return { status: "error", message: TRACKING_NOT_FOUND, fieldErrors: {}, values };
    return { status: "found", order };
  } catch (cause) {
    console.error("trackOrder failed", cause);
    return { status: "error", message: "We couldn't look up your order just now. Please try again in a moment, or call us.", fieldErrors: {}, values };
  }
}
