/*
 * Social profile links (pure, unit tested). Shared by the team member form
 * and the site-wide social links in Admin > Settings: a link must be https
 * and on the network it is labelled as, so a typo or a pasted look-alike
 * link can never send visitors somewhere unexpected.
 */

/**
 * Profile link as an https URL on one of `hosts` (or a subdomain such as
 * www. or pk.), with any fragment dropped. "facebook.com/page" gains https://.
 * Null when the input cannot be used.
 */
export function normalizeProfileUrl(input: string, hosts: ReadonlyArray<string>): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
  let url: URL;
  try { url = new URL(withScheme); } catch { return null; }
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  const host = url.hostname.toLowerCase();
  if (!hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return null;
  url.hash = "";
  return url.toString();
}

/**
 * True for a bare home page such as "https://facebook.com" or
 * "https://www.instagram.com/": a placeholder, not anyone's profile.
 */
export function isBareNetworkHome(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (parsed.pathname === "/" || parsed.pathname === "") && !parsed.search;
  } catch {
    return true;
  }
}
