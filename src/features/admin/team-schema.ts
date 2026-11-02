import { z } from "zod";
import { normalizeProfileUrl } from "@/lib/social-profiles";
import { normalizeWhatsappNumber } from "./whatsapp-settings";

export { normalizeProfileUrl };

/*
 * Team member form (pure, unit tested). Optional fields arrive as "" from the
 * form and are stored as null. Phone numbers are stored in E.164 and profile
 * links must point at the network they are labelled as, so a typo or a pasted
 * look-alike link can never send visitors somewhere unexpected.
 */

const facebook = { field: "facebookUrl", label: "Facebook", hosts: ["facebook.com", "fb.com"], example: "https://facebook.com/your.page" } as const;
const instagram = { field: "instagramUrl", label: "Instagram", hosts: ["instagram.com"], example: "https://instagram.com/yourname" } as const;
const linkedin = { field: "linkedinUrl", label: "LinkedIn", hosts: ["linkedin.com"], example: "https://linkedin.com/in/yourname" } as const;
const x = { field: "xUrl", label: "X (Twitter)", hosts: ["x.com", "twitter.com"], example: "https://x.com/yourname" } as const;

/** Profile links, in the order the form and the About page show them. */
export const socialNetworks = [facebook, instagram, linkedin, x] as const;

type SocialNetworkField = (typeof socialNetworks)[number];

export type SocialField = (typeof socialNetworks)[number]["field"];

/** Pakistani mobiles and international numbers (as for WhatsApp), plus Pakistani landlines such as 091-1234567. */
export function normalizePhone(input: string): string | null {
  const mobileOrInternational = normalizeWhatsappNumber(input);
  if (mobileOrInternational) return mobileOrInternational;
  const landline = /^0([1-9]\d{8,9})$/.exec(input.trim().replace(/[\s().-]/g, ""));
  return landline ? `+92${landline[1]}` : null;
}

/** "" becomes null; anything else must pass `parse` or fails with `message`. */
function optional(max: number, parse: (value: string) => string | null, message: string) {
  return z.string().trim().max(max, message).transform((value, ctx) => {
    if (!value) return null;
    const parsed = parse(value);
    if (parsed === null) { ctx.addIssue({ code: "custom", message }); return z.NEVER; }
    return parsed;
  });
}

const profileUrl = (network: SocialNetworkField) =>
  optional(300, (value) => normalizeProfileUrl(value, network.hosts), `Enter a valid ${network.label} profile link, e.g. ${network.example}.`);

const emailSchema = z.email();

export const teamMemberFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer."),
  role: z.string().trim().min(1, "Role or title is required.").max(120, "Role must be 120 characters or fewer."),
  bio: z.string().trim().max(600, "The short bio must be 600 characters or fewer."),
  photoId: z.union([z.literal("").transform(() => null), z.uuid("Choose the photo again.")]),
  email: optional(254, (value) => {
    const lower = value.toLowerCase();
    return emailSchema.safeParse(lower).success ? lower : null;
  }, "Enter a valid email address, e.g. name@example.com."),
  phone: optional(30, normalizePhone, "Enter a valid phone number, e.g. 0300 1234567 or +92 300 1234567."),
  phoneOnWhatsapp: z.boolean(),
  facebookUrl: profileUrl(facebook),
  instagramUrl: profileUrl(instagram),
  linkedinUrl: profileUrl(linkedin),
  xUrl: profileUrl(x),
  isPublished: z.boolean(),
}).transform((member) => ({ ...member, phoneOnWhatsapp: member.phone ? member.phoneOnWhatsapp : false }));

export type TeamMemberInput = z.output<typeof teamMemberFormSchema>;
