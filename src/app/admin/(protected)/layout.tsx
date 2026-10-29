import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/features/admin/auth-actions";
import { requireAdmin } from "@/server/auth/session";

// Admin data and sessions are intentionally request-time and must never be
// prefetched into a shared static shell.
export const instant = false;

const links = [["/admin", "Overview"], ["/admin/orders", "Orders"], ["/admin/products", "Products"], ["/admin/banners", "Banners"], ["/admin/media", "Media"], ["/admin/content", "Content"], ["/admin/settings", "Settings"]] as const;

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand"><span>AS</span><span>Abdul Sami<small>STORE ADMIN</small></span></Link>
      <nav aria-label="Admin navigation">{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="admin-account"><span>{admin.email}</span><form action={logout}><button type="submit">Sign out</button></form><Link href="/">View store ↗</Link></div>
    </aside>
    <main id="main" className="admin-main">{children}</main>
  </div>;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="admin-loading">Loading admin…</div>}><AdminShell>{children}</AdminShell></Suspense>;
}
