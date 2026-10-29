import { blogPosts } from "@/features/blog/data";
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
  aboutApiaries: "about.apiaries",
  aboutTeam: "about.team",
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
    key: SLOT_KEYS.aboutApiaries,
    group: "About page",
    label: "Our apiaries",
    hint: "Tall portrait photo (3:5) at the top of the About page.",
    kind: "image",
  },
  {
    key: SLOT_KEYS.aboutTeam,
    group: "About page",
    label: "Our team",
    hint: "Tall portrait photo (3:5) beside “Our apiaries”.",
    kind: "image",
  },
  ...teamMembers.map(
    (member): SlotDefinition => ({
      key: teamMemberSlotKey(member.name),
      group: "About page",
      label: `Team: ${member.name}`,
      hint: `${member.role}. Portrait photo (9:10).`,
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
    hint: "Very wide image under the contact form (16:6 on desktop, 4:3 on phones), e.g. a map screenshot.",
    kind: "image",
  },
  {
    key: SLOT_KEYS.blogAuthor,
    group: "Blog",
    label: "Author photo",
    hint: "Square portrait, shown as a circle in the blog sidebar and under posts.",
    kind: "image",
  },
  ...blogPosts.map(
    (post): SlotDefinition => ({
      key: blogCoverSlotKey(post.slug),
      group: "Blog",
      label: `Cover: ${post.title}`,
      hint: "Landscape cover (5:3), also used on blog cards.",
      kind: "image",
    }),
  ),
];

const slotKeys = new Set(slotDefinitions.map((slot) => slot.key));

export function isSlotKey(value: string): boolean {
  return slotKeys.has(value);
}

export function getSlotDefinition(key: string): SlotDefinition | undefined {
  return slotDefinitions.find((slot) => slot.key === key);
}
