/**
 * Site-wide configuration. Contact details and the domain are placeholders
 * (reserved `.example` TLD, 0000000 numbers) until real business details exist.
 */
export const siteConfig = {
  /** Short brand name for tight spaces (title template, social labels). */
  name: "Abdul Sami Honey",
  legalName: "Honey by Abdul Sami Enterprises",
  titleTagline: "Raw & Pure Honey in Pakistan",
  tagline: "Raw, single-origin honey from Pakistani beekeepers, bottled with care.",
  description:
    "Honey by Abdul Sami Enterprises sells raw, unfiltered Pakistani honey: Sidr, Acacia, Wildflower, Black Forest, honeycomb and gift sets, delivered across Pakistan.",
  url: "https://abdulsamihoney.example",
  // Hard-coded rather than computed: a `new Date()` in a shared layout would
  // force request-time rendering under Cache Components.
  copyrightYear: 2026,
  contact: {
    shortAddress: "Gulberg III, Lahore",
    address: "Office 00, Placeholder Plaza, Gulberg III, Lahore, Pakistan",
    phoneDisplay: "+92 300 0000000",
    phoneHref: "tel:+923000000000",
    supportPhoneDisplay: "+92 42 0000000",
    supportPhoneHref: "tel:+92420000000",
    email: "hello@abdulsamihoney.example",
    supportEmail: "support@abdulsamihoney.example",
    careersEmail: "careers@abdulsamihoney.example",
    hours: "Mon–Sat, 10:00am – 7:00pm PKT",
  },
  socials: [
    { network: "facebook", label: "Facebook", href: "https://facebook.com" },
    { network: "instagram", label: "Instagram", href: "https://instagram.com" },
    { network: "youtube", label: "YouTube", href: "https://youtube.com" },
    { network: "x", label: "X (Twitter)", href: "https://x.com" },
  ],
} as const;

export type SocialNetwork = "facebook" | "x" | "instagram" | "dribbble" | "youtube";

export type NavLink = { label: string; href: string };

/** A top-level entry is either a plain link or a labelled group of links. */
export type NavItem =
  | (NavLink & { children?: undefined })
  | { label: string; href?: string; children: ReadonlyArray<NavLink> };

export const mainNav: ReadonlyArray<NavItem> = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Honey", href: "/shop" },
      { label: "Sidr Honey", href: "/shop?category=sidr" },
      { label: "Acacia Honey", href: "/shop?category=acacia" },
      { label: "Wildflower Honey", href: "/shop?category=wildflower" },
      { label: "Black Forest Honey", href: "/shop?category=black-forest" },
      { label: "Pure Natural Honey", href: "/shop?category=pure-natural" },
      { label: "Honeycomb", href: "/shop?category=honeycomb" },
    ],
  },
  { label: "Gift Sets", href: "/shop?category=gift-sets" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
