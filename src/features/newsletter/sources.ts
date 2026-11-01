/** Where a sign-up form sits. Anything unexpected is recorded as "footer". */
export const newsletterSources = ["footer", "about", "home"] as const;
export type NewsletterSource = (typeof newsletterSources)[number];

export function newsletterSource(value: unknown): NewsletterSource {
  return newsletterSources.find((source) => source === value) ?? "footer";
}

export const newsletterSourceLabels: Record<NewsletterSource, string> = { footer: "Site footer", about: "About page", home: "Home page" };

export function newsletterSourceLabel(value: string): string {
  return (newsletterSourceLabels as Record<string, string>)[value] ?? value;
}
