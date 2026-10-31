import Link from "next/link";
import { SearchX } from "lucide-react";

export default function AdminNotFound() {
  return <div className="admin-page">
    <section className="admin-panel admin-fault">
      <span className="admin-empty-icon" aria-hidden="true"><SearchX /></span>
      <h1>We couldn’t find that item.</h1>
      <p className="admin-muted">It may have been deleted, or the link is out of date.</p>
      <div className="admin-actions"><Link className="admin-button" href="/admin">Back to Overview</Link></div>
    </section>
  </div>;
}
