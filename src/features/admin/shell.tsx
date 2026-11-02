import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowUpRight, House, Images, LogOut, Mail, MailPlus, Megaphone, Menu, NotebookPen, Package, PanelsTopLeft, Quote, ReceiptText, Settings, Store, Tags, UsersRound,
  type LucideIcon,
} from "lucide-react";
import { logout } from "./auth-actions";
import { adminNavGroups, adminSettingsItem, bottomBarHrefs, type AdminNavIcon, type AdminNavItem } from "./nav";
import { AdminMoreButton, AdminNavLink } from "./nav-link";
import brandLogo from "../../../images/logo/abdulSamiEnterprisesLogo.png";

/*
 * Admin chrome (server). Desktop: a grouped sidebar. Below 1024px: a slim top
 * bar, a sticky bottom bar and a More sheet built on the Popover API, which
 * needs no JavaScript and gives Esc and light dismiss for free.
 */

const icons: Record<AdminNavIcon, LucideIcon> = {
  house: House, orders: ReceiptText, mail: Mail, package: Package, tags: Tags, megaphone: Megaphone,
  content: PanelsTopLeft, blog: NotebookPen, quote: Quote, team: UsersRound, images: Images, subscribers: MailPlus, settings: Settings,
};

export type NavBadges = Partial<Record<NonNullable<AdminNavItem["badge"]>, { text: string; ariaLabel: string } | null>>;

/**
 * The Abdul Sami Enterprises seal (decorative: the visible wordmark next to it
 * names the brand). The seal's own gold rim separates it from the dark comb;
 * the badge adds a hairline honey ring and a soft lift so it never melts into
 * the sidebar. `sizes` is the rendered CSS width, so next/image serves a 2x
 * file for crisp edges without shipping the 1278px original.
 */
export function BrandLogo({ className = "admin-brand-logo", sizes = "36px" }: { className?: string; sizes?: string }) {
  // Always above the fold (sidebar, top bar, login), so it loads eagerly.
  return <span className={className}>
    <Image src={brandLogo} alt="" sizes={sizes} loading="eager" />
  </span>;
}

function Brand() {
  return <Link href="/admin" className="admin-brand">
    <BrandLogo />
    <span className="admin-brand-text"><span className="admin-brand-name">Honey by Abdul Sami</span><span className="admin-brand-sub">Admin</span></span>
  </Link>;
}

function NavItemLink({ item, badges }: { item: AdminNavItem; badges: NavBadges }) {
  const Icon = icons[item.icon];
  const badge = item.badge ? badges[item.badge] : null;
  return <AdminNavLink href={item.href} className="admin-nav-link" ariaLabel={badge?.ariaLabel}>
    <Icon aria-hidden="true" /><span className="admin-nav-label">{item.label}</span>
    {badge && <span className="admin-nav-badge" aria-hidden="true">{badge.text}</span>}
  </AdminNavLink>;
}

function Account({ email }: { email: string }) {
  return <div className="admin-account">
    <span className="admin-account-email">{email}</span>
    <form action={logout}><button type="submit" className="admin-signout"><LogOut aria-hidden="true" />Sign out</button></form>
  </div>;
}

/** Reveal stagger index: the one inline style the plan allows (§4.5). */
const staggerStyle = (index: number) => ({ "--i": index }) as CSSProperties;

function NavGroups({ badges, groups, stagger }: { badges: NavBadges; groups: typeof adminNavGroups; stagger?: boolean }) {
  const offsets = groups.map((_, groupIndex) => groups.slice(0, groupIndex).reduce((sum, group) => sum + group.items.length, 0));
  return <>{groups.map((group, groupIndex) => <div key={group.label} className="admin-nav-group">
    <h2 className="admin-nav-heading">{group.label}</h2>
    <ul>{group.items.map((item, itemIndex) => <li key={item.href} className="admin-nav-item" style={stagger ? staggerStyle((offsets[groupIndex] ?? 0) + itemIndex) : undefined}><NavItemLink item={item} badges={badges} /></li>)}</ul>
  </div>)}</>;
}

function StoreLink({ className }: { className: string }) {
  return <Link href="/" className={className}><Store aria-hidden="true" /><span>View store</span><ArrowUpRight aria-hidden="true" /></Link>;
}

export function AdminSidebar({ email, badges }: { email: string; badges: NavBadges }) {
  return <div className="admin-sidebar">
    <header><Brand /></header>
    <nav aria-label="Admin" className="admin-nav">
      <NavGroups badges={badges} groups={adminNavGroups} stagger />
      <ul className="admin-nav-footer">
        <li className="admin-nav-item" style={staggerStyle(11)}><NavItemLink item={adminSettingsItem} badges={badges} /></li>
        <li className="admin-nav-item" style={staggerStyle(12)}><StoreLink className="admin-nav-link" /></li>
      </ul>
    </nav>
    <Account email={email} />
  </div>;
}

export function AdminTopBar() {
  return <header className="admin-topbar">
    <Brand />
    <Link href="/" className="admin-topbar-link"><Store aria-hidden="true" />Store<span className="sr-only"> (view the website)</span></Link>
  </header>;
}

export function AdminBottomBar({ email, badges }: { email: string; badges: NavBadges }) {
  const items = adminNavGroups.flatMap((group) => group.items).filter((item) => (bottomBarHrefs as ReadonlyArray<string>).includes(item.href));
  const shortLabel = (item: AdminNavItem) => (item.href === "/admin" ? "Home" : item.label);
  const moreGroups = adminNavGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !(bottomBarHrefs as ReadonlyArray<string>).includes(item.href)) }))
    .filter((group) => group.items.length);
  return <>
    <nav aria-label="Primary" className="admin-bottombar">
      <ul>
        {items.map((item) => {
          const Icon = icons[item.icon];
          const badge = item.badge ? badges[item.badge] : null;
          return <li key={item.href}><AdminNavLink href={item.href} className="admin-tab" ariaLabel={badge?.ariaLabel}>
            <Icon aria-hidden="true" />{shortLabel(item)}{badge && <span className="admin-nav-badge" aria-hidden="true">{badge.text}</span>}
          </AdminNavLink></li>;
        })}
        <li><AdminMoreButton><Menu aria-hidden="true" />More</AdminMoreButton></li>
      </ul>
    </nav>
    <div id="admin-more" popover="auto" className="admin-more" aria-label="More pages">
      <nav aria-label="Admin" className="admin-nav">
        <NavGroups badges={badges} groups={moreGroups} />
        <ul>
          <li><NavItemLink item={adminSettingsItem} badges={badges} /></li>
          <li><StoreLink className="admin-nav-link" /></li>
        </ul>
      </nav>
      <Account email={email} />
    </div>
  </>;
}
