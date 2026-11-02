import { teamMembers } from "@/content/company";

/*
 * Named image/video slots on the storefront. The admin assigns a media item
 * (and for video slots a YouTube link) to each key; empty slots keep the
 * styled ImagePlaceholder. Product, category and banner images are managed
 * on those records instead.
 */

export type SlotKind = "image" | "video";

export type SlotDefinition = {
  key: string;
  group: string;
  label: string;
  /** Where it appears and what shape works best. */
  hint: string;
  kind: SlotKind;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const teamMemberSlotKey = (name: string) => `about.member.${slugify(name)}`;
export const blogCoverSlotKey = (slug: string) => `blog.cover.${slug}`;

export const SLOT_KEYS = {
  homeHero: "home.hero",
  homeDeal: "home.deal",
  homeStory: "home.story",
  // Key kept from the old "Our apiaries" slot so the portrait already uploaded there stays put.
  aboutFounder: "about.apiaries",
  aboutFaq: "about.faq",
  contactMap: "contact.map",
  blogAuthor: "blog.author",
} as const;

export const slotDefinitions: ReadonlyArray<SlotDefinition> = [
  {
    key: SLOT_KEYS.homeHero,
    group: "Home page",
    label: "Hero photo",
    hint: "Full-width hero background with an 80% dark overlay. Use a landscape image with space for copy on the left. Hero banners can override it.",
    kind: "image",
  },
  {
    key: SLOT_KEYS.homeDeal,
    group: "Home page",
    label: "Deal fallback photo",
    hint: "Used in the deal band when the active deal banner has no image of its own. Landscape 5:4.",
    kind: "image",
  },
  {
    key: SLOT_KEYS.homeStory,
    group: "Home page",
    label: "“From hive to jar” video",
    hint: "Wide poster image (about 2.3:1 on desktop, 16:9 on phones) plus a YouTube link that plays when visitors press play.",
    kind: "video",
  },
  {
    key: SLOT_KEYS.aboutFounder,
    group: "About page",
    label: "Founder portrait (Abdul Sami)",
    hint: "Portrait photo (4:5) beside “How it started”. Keep the face in the upper middle; a small badge overlaps the lower-right corner.",
    kind: "image",
  },
  ...teamMembers.map(
    (member): SlotDefinition => ({
      key: teamMemberSlotKey(member.name),
      group: "About page",
      label: `Team: ${member.name}`,
      hint: `${member.role}. Portrait photo (9:10). Placeholder team: shown only until you publish a member under Team.`,
      kind: "image",
    }),
  ),
  {
    key: SLOT_KEYS.aboutFaq,
    group: "About page",
    label: "FAQ photo",
    hint: "Landscape photo (4:3) beside the questions.",
    kind: "image",
  },
  {
    key: SLOT_KEYS.contactMap,
    group: "Contact page",
    label: "Map or shop photo",
    hint: "Shop photo in the “Visit the shop” card on the Contact page. Landscape 3:2 on phones; cropped near-square on tablets and desktops, so keep the subject centred.",
    kind: "image",
  },
  {
    key: SLOT_KEYS.blogAuthor,
    group: "Blog",
    label: "Author photo",
    hint: "Square portrait for the blog sidebar and posts. If unset, Sana Malik's team portrait is used.",
    kind: "image",
  },
];

const slotKeys = new Set(slotDefinitions.map((slot) => slot.key));

export function isSlotKey(value: string): boolean {
  return slotKeys.has(value);
}

export function getSlotDefinition(key: string): SlotDefinition | undefined {
  return slotDefinitions.find((slot) => slot.key === key);
}
