import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { waLink } from "@/features/admin/contact-links";
import { saveSocialLinks } from "@/features/admin/social-settings-actions";
import { SubmitButton } from "@/features/admin/submit-button";
import { AdminHeading, AdminNotice, Field, Notice } from "@/features/admin/ui";
import { saveWhatsappSettings } from "@/features/admin/whatsapp-settings-actions";
import { siteSocialNetworks, socialFieldName, socialVisibleName, type StoredSocialLinks } from "@/features/settings/site-socials";
import { requireAdmin } from "@/server/auth/session";
import { isUndefinedColumn } from "@/server/db-errors";

/** Stored social links; `ready: false` until the social_links migration is applied. */
async function loadSocialLinks(): Promise<{ ready: boolean; links: StoredSocialLinks }> {
  try {
    const [row] = await db.select({ socialLinks: storeSettings.socialLinks }).from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
    return { ready: true, links: row?.socialLinks ?? {} };
  } catch (error) {
    if (isUndefinedColumn(error)) return { ready: false, links: {} };
    throw error;
  }
}

export const instant = false;
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const admin = await requireAdmin();
  const [rows, social, notice] = await Promise.all([
    db.select({ orderWhatsappNumber: storeSettings.orderWhatsappNumber }).from(storeSettings).where(eq(storeSettings.id, 1)).limit(1),
    loadSocialLinks(),
    searchParams,
  ]);
  const number = rows[0]?.orderWhatsappNumber ?? "";
  const testLink = number ? waLink(number) : null;
  return <div className="admin-page">
    <AdminHeading eyebrow="Settings" title="Settings" description="Admin account and store configuration." />
    <AdminNotice {...notice} message={notice.saved === "social" ? "Social links saved. The website shows them now." : "WhatsApp number saved."} />
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
    <section className="admin-panel admin-stack" aria-labelledby="social-title">
      <h2 id="social-title">Social media</h2>
      <p className="admin-hint">Shown at the top of the home page, in the footer and on the blog. Paste the full link to your page or profile. Leave a field empty, or switch off Show, to hide that network.</p>
      {social.ready ? <form action={saveSocialLinks} className="admin-form">
        <div className="admin-social-list">
          {siteSocialNetworks.map((item) => {
            const saved = social.links[item.network];
            return <div key={item.network} className="admin-social-row">
              <Field label={item.fieldLabel} optional>
                <input type="text" inputMode="url" name={socialFieldName(item.network)} defaultValue={saved?.url ?? ""} maxLength={300} placeholder={item.example} autoComplete="off" spellCheck={false} />
              </Field>
              <label className="admin-switch"><input type="checkbox" name={socialVisibleName(item.network)} value="yes" defaultChecked={saved?.visible ?? true} aria-label={`Show ${item.fieldLabel} on the website`} /> Show</label>
            </div>;
          })}
        </div>
        <div className="admin-actions"><SubmitButton>Save social links</SubmitButton></div>
      </form> : <Notice tone="info" title="Social links are not set up yet">
        <p>The database needs a small update before social links can be saved. Ask your developer to run the pending database migration.</p>
      </Notice>}
    </section>
  </div>;
}
