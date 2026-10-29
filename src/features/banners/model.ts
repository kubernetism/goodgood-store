import { z } from "zod";
import { pktLocalToDate } from "@/lib/pk-time";
import type { ImageAsset } from "@/features/products/types";

export const bannerPlacements = [
  { value: "hero", label: "Home hero", hint: "Replaces the headline, text, button and photo at the top of the home page." },
  { value: "deal", label: "Deal band", hint: "The dark promo band with a countdown. Link it to a product to show its price." },
  { value: "announcement", label: "Announcement bar", hint: "One line of text in the bar above the home page header." },
] as const;

export type BannerPlacement = (typeof bannerPlacements)[number]["value"];

export function placementLabel(placement: BannerPlacement): string {
  return bannerPlacements.find((option) => option.value === placement)?.label ?? placement;
}

/** A banner as the storefront renders it. */
export type StorefrontBanner = {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle: string;
  image: ImageAsset | null;
  ctaLabel: string;
  ctaHref: string;
  /** Deal banners: linked product slug (price and default link). */
  productSlug: string | null;
  /** ISO timestamp; drives the deal countdown. */
  endsAt: string | null;
};

export type ActiveBanners = Record<BannerPlacement, StorefrontBanner | null>;

export type BannerCandidate = StorefrontBanner & {
  isActive: boolean;
  startsAt: string | null;
  sortOrder: number;
};

export function isBannerLive(banner: Pick<BannerCandidate, "isActive" | "startsAt" | "endsAt">, now: Date): boolean {
  if (!banner.isActive) return false;
  if (banner.startsAt && Date.parse(banner.startsAt) > now.getTime()) return false;
  if (banner.endsAt && Date.parse(banner.endsAt) <= now.getTime()) return false;
  return true;
}

/** First live banner per placement, by sort order (lowest first). */
export function pickActiveBanners(candidates: ReadonlyArray<BannerCandidate>, now: Date): ActiveBanners {
  const result: ActiveBanners = { hero: null, deal: null, announcement: null };
  const sorted = [...candidates].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const candidate of sorted) {
    if (result[candidate.placement] || !isBannerLive(candidate, now)) continue;
    result[candidate.placement] = {
      id: candidate.id, placement: candidate.placement, title: candidate.title, subtitle: candidate.subtitle,
      image: candidate.image, ctaLabel: candidate.ctaLabel, ctaHref: candidate.ctaHref,
      productSlug: candidate.productSlug, endsAt: candidate.endsAt,
    };
  }
  return result;
}

/**
 * Safe link targets: a site path ("/shop?category=sidr", not "//host") or an
 * absolute https URL. Anything else (javascript:, data:, http:) is refused.
 */
export function isSafeHref(value: string): boolean {
  if (value.startsWith("/")) return !value.startsWith("//") && !value.startsWith("/\\");
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

const optionalPktDate = z
  .string()
  .trim()
  .transform((value, context) => {
    if (!value) return null;
    const date = pktLocalToDate(value);
    if (!date) {
      context.addIssue({ code: "custom", message: "Enter a valid date and time." });
      return z.NEVER;
    }
    return date;
  });

/** Admin banner form (all fields arrive as strings from FormData). */
export const bannerFormSchema = z
  .object({
    placement: z.enum(["hero", "deal", "announcement"], { message: "Choose where the banner appears." }),
    title: z.string().trim().min(1, "Enter a title.").max(120, "Keep the title under 120 characters."),
    subtitle: optionalText(300),
    ctaLabel: optionalText(40),
    ctaHref: optionalText(500).refine((value) => !value || isSafeHref(value), {
      message: "Use a site path like /shop or a full https:// link.",
    }),
    imageId: z.union([z.uuid(), z.literal("")]).transform((value) => value || null),
    productId: z.union([z.uuid(), z.literal("")]).transform((value) => value || null),
    isActive: z.string().optional().transform((value) => value === "on" || value === "true"),
    startsAt: optionalPktDate,
    endsAt: optionalPktDate,
    sortOrder: z.coerce.number().int("Use a whole number.").min(0).max(9999).default(0),
  })
  .superRefine((value, context) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      context.addIssue({ code: "custom", path: ["endsAt"], message: "The end must be after the start." });
    }
    if (value.ctaLabel && !value.ctaHref && !(value.placement === "deal" && value.productId)) {
      context.addIssue({ code: "custom", path: ["ctaHref"], message: "Add a link for the button." });
    }
  });

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
