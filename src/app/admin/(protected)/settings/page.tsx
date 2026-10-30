import { AdminHeading, AdminNotice } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { saveWhatsappSettings } from "@/features/admin/whatsapp-settings-actions";

export const instant = false;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const admin = await requireAdmin();
  const [rows, notice] = await Promise.all([
    db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1),
    searchParams,
  ]);
  return <><AdminHeading title="Settings" description="Admin account and store configuration." /><AdminNotice {...notice} />
    <section className="admin-panel"><h2>Admin account</h2><p>{admin.email}</p><p className="admin-muted">To change the password, update ADMIN_PASSWORD in your private environment and run the admin setup script. Existing sessions will be signed out.</p></section>
    <section className="admin-panel" style={{ marginTop: 16 }}><h2>Order WhatsApp number</h2>
      <p className="admin-muted">After an order is placed, customers can send its details to this number using WhatsApp. Customers must tap Send in WhatsApp.</p>
      <form action={saveWhatsappSettings} className="admin-form" style={{ marginTop: 16 }}>
        <label>WhatsApp number<input type="tel" name="orderWhatsappNumber" defaultValue={rows[0]?.orderWhatsappNumber ?? ""} placeholder="+92 300 1234567" autoComplete="tel" /></label>
        <p className="admin-muted">Include the country code, or enter a Pakistani mobile number. Leave blank to remove the number.</p>
        <div><button className="admin-button">Save WhatsApp number</button></div>
      </form>
    </section>
  </>;
}
