import { AdminHeading } from "@/features/admin/ui";
import { requireAdmin } from "@/server/auth/session";

export const instant = false;

export default async function SettingsPage() {
  const admin = await requireAdmin();
  return <><AdminHeading title="Settings" description="Admin account and store configuration." /><section className="admin-panel"><h2>Admin account</h2><p>{admin.email}</p><p className="admin-muted">To change the password, update ADMIN_PASSWORD in your private environment and run the admin setup script. Existing sessions will be signed out.</p></section></>;
}
