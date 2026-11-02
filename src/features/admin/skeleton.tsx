import { HoneycombLoader } from "@/components/ui/honeycomb-mark";

/** Loading placeholders shaped like the final layout, so nothing jumps (CLS). */
export function PageSkeleton() {
  return <div className="admin-skeleton">
    <HoneycombLoader size={40} className="admin-skeleton-status" />
    <div className="admin-skel admin-skel-line" aria-hidden="true" />
    <div className="admin-skel admin-skel-title" aria-hidden="true" />
    <div className="admin-panel admin-stack-sm" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="admin-skel admin-skel-row" />)}
    </div>
  </div>;
}

export function ShellSkeleton() {
  return <div className="admin-shell">
    <div className="admin-sidebar" aria-hidden="true" />
    <div>
      <div className="admin-topbar" aria-hidden="true" />
      <div className="admin-main"><PageSkeleton /></div>
    </div>
  </div>;
}
