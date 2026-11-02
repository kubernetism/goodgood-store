import Link from "next/link";
import { cloneElement, useId, type ReactElement, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Info, Plus, Search, SlidersHorizontal, TriangleAlert, X } from "lucide-react";
import type { OrderStatus } from "@/features/orders/status";
import { orderStatusLabels } from "@/features/orders/status";
import { FlashNotice } from "./flash-notice";
import { HEX_LEVELS, hexLevel, type HexLevel, type PillTone } from "./status-display";

export { pageNumber } from "./search-params";

/* ── Page header ────────────────────────────────────────────────────── */

export function AdminHeading({ title, description, eyebrow, back, actions, meta, href, action, identifier = false }: {
  title: string;
  description?: string;
  /** The nav group, e.g. "Catalogue". */
  eyebrow?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  /** Status pill, dates and similar next to the title. */
  meta?: ReactNode;
  /** Shortcut for a single primary "Add …" action. */
  href?: string;
  action?: string;
  /** The title is an identifier (order numbers). */
  identifier?: boolean;
}) {
  const shortcut = href && action ? <Link className="admin-button" href={href}><Plus aria-hidden="true" />{action}</Link> : null;
  const headerActions = actions ?? shortcut;
  return <header className="admin-head">
    <div className="admin-head-text">
      {back && <Link className="admin-back" href={back.href}><ArrowLeft aria-hidden="true" />{back.label}</Link>}
      {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
      <h1 className={identifier ? "admin-order-number" : undefined}>{title}</h1>
      {meta && <div className="admin-head-meta">{meta}</div>}
      {description && <p className="admin-muted">{description}</p>}
    </div>
    {headerActions && <div className="admin-head-actions">{headerActions}</div>}
  </header>;
}

/* ── Notices ────────────────────────────────────────────────────────── */

/** Static inline notice (no focus management). */
export function Notice({ tone = "info", title, children }: { tone?: "info" | "success" | "error"; title?: string; children: ReactNode }) {
  const Icon = tone === "error" ? TriangleAlert : tone === "success" ? CircleCheck : Info;
  return <div className="admin-notice" data-tone={tone} role={tone === "error" ? "alert" : tone === "success" ? "status" : undefined}>
    <Icon aria-hidden="true" />
    <div className="admin-notice-body">{title && <strong>{title}</strong>}{children}</div>
  </div>;
}

/**
 * Result of a redirecting Server Action (?saved=1 or ?error=…). `message`
 * replaces the generic "Changes saved." where the page knows the context.
 * `clear` lists every flag parameter the page uses, so all are stripped.
 */
export function AdminNotice({ error, saved, message, clear = "saved,error" }: { error?: string; saved?: string; message?: string; clear?: string }) {
  if (error) return <FlashNotice tone="error" clear={clear}><TriangleAlert aria-hidden="true" /><div className="admin-notice-body">{error}</div></FlashNotice>;
  if (saved) return <FlashNotice tone="success" clear={clear}><CircleCheck aria-hidden="true" /><div className="admin-notice-body">{message ?? "Changes saved."}</div></FlashNotice>;
  return null;
}

/* ── Pager ──────────────────────────────────────────────────────────── */

export function Pager({ page, hasNext, base, shown, pageSize = 20, param = "page", label = "Pagination" }: { page: number; hasNext: boolean; base: string; shown?: number; pageSize?: number; param?: string; label?: string }) {
  if (page <= 1 && !hasNext) return null;
  const join = base.includes("?") ? "&" : "?";
  const href = (target: number) => `${base}${join}${param}=${target}`;
  const first = (page - 1) * pageSize + 1;
  const status = shown ? `Showing ${first}–${first + shown - 1}` : `Page ${page}`;
  return <nav aria-label={label} className="admin-pager">
    {page > 1
      ? <Link className="admin-button secondary" href={href(page - 1)}><ChevronLeft aria-hidden="true" />Previous</Link>
      : <span className="admin-button secondary" aria-disabled="true"><ChevronLeft aria-hidden="true" />Previous</span>}
    <span className="admin-muted">{status}</span>
    {hasNext
      ? <Link className="admin-button secondary" href={href(page + 1)}>Next<ChevronRight aria-hidden="true" /></Link>
      : <span className="admin-button secondary" aria-disabled="true">Next<ChevronRight aria-hidden="true" /></span>}
  </nav>;
}

/* ── Hexagon glyph and status pills ─────────────────────────────────── */

const HEX = "M7 1.2 12.6 4.4V11.6L7 14.8 1.4 11.6V4.4Z";

/** The "filling cell": an outline hexagon filled bottom-up in fifths (one per stage). Decorative. */
export function HexGlyph({ level, struck = false, className = "admin-hex" }: { level: HexLevel; struck?: boolean; className?: string }) {
  const clipId = useId();
  const height = (16 * level) / HEX_LEVELS;
  return <svg className={className} viewBox="0 0 14 16" aria-hidden="true" focusable="false">
    {level > 0 && <>
      <clipPath id={clipId}><rect x="0" y={16 - height} width="14" height={height} /></clipPath>
      <path d={HEX} fill="currentColor" clipPath={`url(#${clipId})`} />
    </>}
    <path d={HEX} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {struck && <path d="M2.5 13.2 11.5 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
  </svg>;
}

/** A status label with optional glyph. The text label always carries the meaning. */
export function StatusPill({ tone, label, glyph }: { tone: PillTone; label: string; glyph?: { level: HexLevel; struck?: boolean } }) {
  return <span className="admin-pill" data-tone={tone}>{glyph && <HexGlyph level={glyph.level} struck={glyph.struck} />}{label}</span>;
}

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return <StatusPill tone={status} label={orderStatusLabels[status]} glyph={hexLevel(status)} />;
}

/* ── Stat card ──────────────────────────────────────────────────────── */

export function StatCard({ href, label, value, context, attention = false, pulse = false }: {
  href?: string;
  label: string;
  value: ReactNode;
  context?: ReactNode;
  /** Something is waiting (pending orders, unread messages). */
  attention?: boolean;
  pulse?: boolean;
}) {
  const body = <>
    <span className="admin-stat-label">{attention && <HexGlyph level={0} />}{label}</span>
    <span className="admin-stat-value">{value}</span>
    {context && <span className="admin-stat-context">{context}</span>}
    {href && <ArrowUpRight className="admin-stat-arrow" aria-hidden="true" />}
  </>;
  const flags = { "data-attention": attention || undefined, "data-pulse": (attention && pulse) || undefined };
  return href ? <Link href={href} className="admin-stat" {...flags}>{body}</Link> : <div className="admin-stat" {...flags}>{body}</div>;
}

/* ── Empty state ────────────────────────────────────────────────────── */

export function EmptyState({ icon, title, children, actions, headingLevel = 2 }: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return <div className="admin-empty">
    <span className="admin-empty-icon" aria-hidden="true">{icon}</span>
    <Heading>{title}</Heading>
    {children && <p>{children}</p>}
    {actions && <div className="admin-actions">{actions}</div>}
  </div>;
}

/* ── Danger zone (in-page confirmation, no modal) ───────────────────── */

export function DangerZone({ id, open, summary, children }: { id?: string; open?: boolean; summary: string; children: ReactNode }) {
  return <details id={id} open={open || undefined} className="admin-danger-zone">
    <summary><TriangleAlert aria-hidden="true" />{summary}<ChevronDown className="admin-chevron" aria-hidden="true" /></summary>
    <div className="admin-danger-body">{children}</div>
  </details>;
}

/* ── Form field ─────────────────────────────────────────────────────── */

type ControlProps = { id?: string; "aria-describedby"?: string };

/**
 * Label, optional marker and hint above a single native control. The hint is
 * wired to the control with aria-describedby.
 */
export function Field({ label, hint, optional = false, children, className }: {
  label: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactElement<ControlProps>;
  className?: string;
}) {
  const id = useId();
  const controlId = children.props.id ?? `${id}-control`;
  const hintId = hint ? `${id}-hint` : undefined;
  return <div className={className ? `admin-field ${className}` : "admin-field"}>
    <label className="admin-label" htmlFor={controlId}>{label}{optional && <span className="admin-optional"> (optional)</span>}</label>
    {hint && <p id={hintId} className="admin-hint">{hint}</p>}
    {cloneElement(children, { id: controlId, "aria-describedby": [children.props["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined })}
  </div>;
}

/** Removable active-filter chips; each is a link to the URL without that filter. */
export function FilterChips({ chips }: { chips: ReadonlyArray<{ label: string; href: string }> }) {
  if (!chips.length) return null;
  return <div className="admin-filter-chips">
    <span className="admin-muted">Filtered by</span>
    {chips.map((chip) => <Link key={chip.label} className="admin-filter-chip" href={chip.href} aria-label={`Remove filter: ${chip.label}`}>{chip.label}<X aria-hidden="true" /></Link>)}
  </div>;
}

/* ── List filters (GET forms) ───────────────────────────────────────── */

/**
 * Search plus optional extra filters. Phones show search and Apply on one
 * row with the extras behind a "Filters (n)" disclosure; desktop shows all.
 */
export function ListFilters({ action, label, q, placeholder, activeCount = 0, resetHref, children }: {
  action: string;
  label: string;
  q: string;
  placeholder: string;
  activeCount?: number;
  /** Shown only when any filter differs from the default. */
  resetHref?: string;
  children?: ReactNode;
}) {
  const id = useId();
  return <form role="search" aria-label={label} action={action} className="admin-filters">
    <div className="admin-field admin-filter-search">
      <label className="admin-label" htmlFor={`${id}-q`}>Search</label>
      <div className="admin-search-input"><Search aria-hidden="true" /><input id={`${id}-q`} name="q" type="search" defaultValue={q} placeholder={placeholder} /></div>
    </div>
    {children && <details className="admin-filter-more">
      <summary><SlidersHorizontal aria-hidden="true" />Filters{activeCount ? ` (${activeCount})` : ""}</summary>
      <div className="admin-filter-more-body">{children}</div>
    </details>}
    <div className="admin-filter-buttons">
      <button className="admin-button secondary">Apply</button>
      {resetHref && (activeCount > 0 || q) && <Link className="admin-button quiet" href={resetHref}>Reset</Link>}
    </div>
  </form>;
}

export function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <Field label={label}><select name={name} defaultValue={defaultValue}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>;
}
