import { telHref, waLink } from "@/features/admin/contact-links";

/*
 * Contact and profile links for a team member on the About page (pure, unit
 * tested). Only fields that are actually set produce a link, in a fixed order.
 */

export type TeamLinkKind = "email" | "phone" | "whatsapp" | "facebook" | "instagram" | "linkedin" | "x";
export type TeamLink = { kind: TeamLinkKind; href: string; label: string; external: boolean };

export type TeamLinkFields = {
  name: string;
  email: string | null;
  phone: string | null;
  phoneOnWhatsapp: boolean;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
};

export function teamMemberLinks(member: TeamLinkFields): TeamLink[] {
  const links: TeamLink[] = [];
  const add = (kind: TeamLinkKind, href: string | null, label: string, external = true) => {
    if (href) links.push({ kind, href, label, external });
  };
  add("email", member.email ? `mailto:${member.email}` : null, `Email ${member.name}`, false);
  add("phone", member.phone ? telHref(member.phone) : null, `Call ${member.name}`, false);
  add("whatsapp", member.phone && member.phoneOnWhatsapp ? waLink(member.phone) : null, `WhatsApp ${member.name}`);
  add("facebook", httpsOnly(member.facebookUrl), `${member.name} on Facebook`);
  add("instagram", httpsOnly(member.instagramUrl), `${member.name} on Instagram`);
  add("linkedin", httpsOnly(member.linkedinUrl), `${member.name} on LinkedIn`);
  add("x", httpsOnly(member.xUrl), `${member.name} on X`);
  return links;
}

/** Defence in depth: the form and a CHECK constraint already require https. */
function httpsOnly(url: string | null): string | null {
  return url && url.startsWith("https://") ? url : null;
}
