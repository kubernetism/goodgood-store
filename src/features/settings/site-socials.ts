import { z } from "zod";
import { isBareNetworkHome, normalizeProfileUrl } from "@/lib/social-profiles";

/*
 * Site-wide social links (pure, unit tested): the networks the admin can set
 * in Settings, how each link is validated, and how stored settings become the
 * links the header, footer and blog show. Team members' own profiles are
 * separate (features/team).
 */

export const siteSocialNetworks = [
  { network: "facebook", label: "Facebook", fieldLabel: "Facebook", hosts: ["facebook.com", "fb.com"], example: "https://facebook.com/yourpage" },
  { network: "instagram", label: "Instagram", fieldLabel: "Instagram", hosts: ["instagram.com"], example: "https://instagram.com/yourname" },
  { network: "youtube", label: "YouTube", fieldLabel: "YouTube", hosts: ["youtube.com"], example: "https://youtube.com/@yourchannel" },
  { network: "tiktok", label: "TikTok", fieldLabel: "TikTok", hosts: ["tiktok.com"], example: "https://tiktok.com/@yourname" },
  { network: "x", label: "X (Twitter)", fieldLabel: "X (Twitter)", hosts: ["x.com", "twitter.com"], example: "https://x.com/yourname" },
  { network: "linkedin", label: "LinkedIn", fieldLabel: "LinkedIn", hosts: ["linkedin.com"], example: "https://linkedin.com/company/yourcompany" },
  { network: "whatsapp", label: "WhatsApp", fieldLabel: "WhatsApp channel", hosts: ["whatsapp.com"], example: "https://whatsapp.com/channel/0029Va…" },
] as const;

export type SiteSocialNetwork = (typeof siteSocialNetworks)[number]["network"];
/** What Settings stores (jsonb): only networks with a link; `visible: false` keeps the link but hides it. */
export type StoredSocialLinks = Partial<Record<SiteSocialNetwork, { url: string; visible: boolean }>>;
export type SiteSocialLink = { network: SiteSocialNetwork; label: string; href: string };

const definition = (network: SiteSocialNetwork) => siteSocialNetworks.find((item) => item.network === network) ?? siteSocialNetworks[0];

/**
 * A usable profile link for `network`, or null: https, on that network's
 * domain, not just its home page, and for WhatsApp a channel link.
 */
export function normalizeSiteSocialUrl(network: SiteSocialNetwork, input: string): string | null {
  const url = normalizeProfileUrl(input, definition(network).hosts);
  if (!url || isBareNetworkHome(url)) return null;
  if (network === "whatsapp" && !new URL(url).pathname.startsWith("/channel/")) return null;
  return url;
}

export const socialFieldName = (network: SiteSocialNetwork) => `${network}Url` as const;
export const socialVisibleName = (network: SiteSocialNetwork) => `${network}Visible` as const;

/** Settings form → stored links. Empty fields are dropped (empty means hidden). */
export function parseSocialLinksForm(form: FormData): { ok: true; links: StoredSocialLinks } | { ok: false; error: string } {
  const links: StoredSocialLinks = {};
  for (const item of siteSocialNetworks) {
    const input = String(form.get(socialFieldName(item.network)) ?? "").trim();
    if (!input) continue;
    if (input.length > 300) return { ok: false, error: `The ${item.fieldLabel} link is too long.` };
    const url = normalizeSiteSocialUrl(item.network, input);
    if (!url) return { ok: false, error: `Enter a valid ${item.fieldLabel} link, e.g. ${item.example}` };
    links[item.network] = { url, visible: form.get(socialVisibleName(item.network)) === "yes" };
  }
  return { ok: true, links };
}

const storedEntry = z.object({ url: z.string(), visible: z.boolean() });

/**
 * The links to show, in a fixed network order. `stored` is the raw jsonb
 * value: null means Settings were never saved, so real (non-placeholder)
 * links from site config are used instead. Every link is re-validated, so a
 * bad value in the database is skipped rather than shown.
 */
export function resolveSiteSocialLinks(
  stored: unknown,
  fallback: ReadonlyArray<{ network: string; href: string }>,
): SiteSocialLink[] {
  const show = (network: SiteSocialNetwork, input: string): SiteSocialLink[] => {
    const href = normalizeSiteSocialUrl(network, input);
    return href ? [{ network, label: definition(network).label, href }] : [];
  };
  if (stored === null || stored === undefined) {
    return siteSocialNetworks.flatMap((item) => {
      const usable = fallback.filter((link) => link.network === item.network).flatMap((link) => show(item.network, link.href));
      return usable.slice(0, 1);
    });
  }
  const parsed = z.record(z.string(), z.unknown()).safeParse(stored);
  const record = parsed.success ? parsed.data : {};
  return siteSocialNetworks.flatMap((item) => {
    const entry = storedEntry.safeParse(record[item.network]);
    return entry.success && entry.data.visible ? show(item.network, entry.data.url) : [];
  });
}
