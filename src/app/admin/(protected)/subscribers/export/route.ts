import { desc, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";
import { toCsv } from "@/features/admin/csv";
import { newsletterSourceLabel } from "@/features/newsletter/sources";
import { dateToPktLocal } from "@/lib/pk-time";
import { requireAdmin } from "@/server/auth/session";

/**
 * Subscriber list as CSV for the owner's email tool. Route Handlers are not
 * covered by the admin layout, so this checks the session itself; without
 * one, requireAdmin() redirects to the login page.
 */
export async function GET() {
  await requireAdmin();
  const rows = await db
    .select({ email: newsletterSubscribers.email, source: newsletterSubscribers.source, createdAt: newsletterSubscribers.createdAt })
    .from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.unsubscribedAt))
    .orderBy(desc(newsletterSubscribers.createdAt));
  const now = new Date();
  const csv = toCsv(
    ["Email", "Signed up from", "Joined (PKT)"],
    rows.map((row) => [row.email, newsletterSourceLabel(row.source), dateToPktLocal(row.createdAt).replace("T", " ")]),
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${dateToPktLocal(now).slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
