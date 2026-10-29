import Link from "next/link";

export function AdminHeading({ title, description, href, action }: { title: string; description?: string; href?: string; action?: string }) {
  return <header className="admin-head"><div><p className="admin-eyebrow">STORE MANAGEMENT</p><h1>{title}</h1>{description && <p className="admin-muted">{description}</p>}</div>{href && action && <Link className="admin-button" href={href}>{action}</Link>}</header>;
}

export function AdminNotice({ error, saved }: { error?: string; saved?: string }) {
  if (error) return <p className="admin-message admin-error" role="alert">{error}</p>;
  if (saved) return <p className="admin-message" role="status">Changes saved.</p>;
  return null;
}

export function Pager({ page, hasNext, base }: { page: number; hasNext: boolean; base: string }) {
  const join = base.includes("?") ? "&" : "?";
  return <div className="admin-actions" style={{ marginTop: 20 }}>
    {page > 1 && <Link className="admin-button secondary" href={`${base}${join}page=${page - 1}`}>Previous</Link>}
    <span className="admin-muted">Page {page}</span>
    {hasNext && <Link className="admin-button secondary" href={`${base}${join}page=${page + 1}`}>Next</Link>}
  </div>;
}

export function pageNumber(input: string | undefined): number {
  const page = Number(input ?? 1);
  return Number.isInteger(page) ? Math.min(10000, Math.max(1, page)) : 1;
}
