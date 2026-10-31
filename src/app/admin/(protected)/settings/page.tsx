import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { waLink } from "@/features/admin/contact-links";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminHeading, AdminNotice, Field } from "@/features/admin/ui";
import { saveWhatsappSettings } from "@/features/admin/whatsapp-settings-actions";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const admin = await requireAdmin();
  const [rows, notice] = await Promise.all([
    db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1),
    searchParams,
  ]);
  const number = rows[0]?.orderWhatsappNumber ?? "";
  const testLink = number ? waLink(number) : null;
  return <div className="admin-page">
    <AdminHeading eyebrow="Settings" title="Settings" description="Admin account and store configuration." />
    <AdminNotice {...notice} message="WhatsApp number saved." />
    <section className="admin-panel admin-stack" aria-labelledby="account-title">
      <h2 id="account-title">Admin account</h2>
      <dl className="admin-dl"><div><dt>Signed in as</dt><dd className="admin-mono">{admin.email}</dd></div></dl>
      <details className="admin-stack-sm">
        <summary className="admin-button quiet">How to change the password</summary>
        <p className="admin-hint">Update ADMIN_PASSWORD in your private environment and run the admin setup script. Existing sessions will be signed out.</p>
      </details>
    </section>
    <section className="admin-panel admin-stack" aria-labelledby="whatsapp-title">
      <h2 id="whatsapp-title">Order WhatsApp number</h2>
      <p className="admin-hint">After an order is placed, customers can send its details to this number using WhatsApp. Customers must tap Send in WhatsApp.</p>
      <form action={saveWhatsappSettings} className="admin-form">
        <Field label="WhatsApp number" optional hint="Include the country code (+92), or enter a Pakistani mobile number. Leave blank to remove the number.">
          <input type="tel" name="orderWhatsappNumber" defaultValue={number} placeholder="+92 300 1234567" autoComplete="tel" inputMode="tel" />
        </Field>
        <div className="admin-actions">
          <SubmitButton>Save WhatsApp number</SubmitButton>
          {testLink && <a className="admin-button quiet" href={testLink} target="_blank" rel="noopener noreferrer">Test on WhatsApp<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens WhatsApp)</span></a>}
        </div>
      </form>
    </section>
  </div>;
}
