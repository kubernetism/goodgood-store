import { Suspense } from "react";
import { countUnreadMessages } from "@/features/admin/message-data";
import { navBadge } from "@/features/admin/nav-badge";
import { ShellBoot } from "@/features/admin/nav-link";
import { countPendingOrders } from "@/features/admin/order-data";
import { AdminBottomBar, AdminSidebar, AdminTopBar } from "@/features/admin/shell";
import { ShellSkeleton } from "@/features/admin/skeleton";
import { requireAdmin } from "@/server/auth/session";

// Admin data and sessions are intentionally request-time and must never be
// prefetched into a shared static shell.
export const instant = false;

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  // Badges are a convenience: a failed count must not take the whole admin down.
  const [unread, pending] = await Promise.all([
    countUnreadMessages().catch((cause) => { console.error("Unread message count failed", cause); return 0; }),
    countPendingOrders().catch((cause) => { console.error("Pending order count failed", cause); return 0; }),
  ]);
  const badges = { unread: navBadge("Messages", unread), pending: navBadge("Orders", pending, "pending") };
  return <div className="admin-shell">
    <AdminSidebar email={admin.email} badges={badges} />
    <div>
      <AdminTopBar />
      <main id="main" tabIndex={-1} className="admin-main">{children}</main>
    </div>
    <AdminBottomBar email={admin.email} badges={badges} />
    <ShellBoot />
  </div>;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ShellSkeleton />}><AdminShell>{children}</AdminShell></Suspense>;
}
