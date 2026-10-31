"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

// Error boundaries must be Client Components. Never show the error message:
// server errors are redacted in production and may contain internals in dev.
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <div className="admin-page">
    <section className="admin-panel admin-fault" role="alert">
      <span className="admin-empty-icon" aria-hidden="true"><TriangleAlert /></span>
      <h1>Something went wrong loading this page.</h1>
      <p className="admin-muted">Your changes may not have been saved. Check your connection and try again.</p>
      <div className="admin-actions">
        <button type="button" className="admin-button" onClick={() => retry()}>Try again</button>
        <Link className="admin-button secondary" href="/admin">Go to Overview</Link>
      </div>
    </section>
  </div>;
}
