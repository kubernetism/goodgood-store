const contactPeople = [
  { name: "Salman Sami", phoneDisplay: "0311-9000985", phoneHref: "tel:+923119000985" },
  { name: "M.D Basit Khan", phoneDisplay: "0319-9073330", phoneHref: "tel:+923199073330" },
  { name: "Mubashir Khan", phoneDisplay: "0315-9021627", phoneHref: "tel:+923159021627" },
] as const;

/** Site-wide configuration. The domain and social URLs still await confirmation. */
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
    businessName: "Abdul Sami Honey Enterprises",
    businessType: "Import & Export",
    branch: "Branch No. 2",
    shortAddress: "Main GT Road, Peshawar",
    address: "Usman Tower, Shop No. 1, 2, 3, Byco Pump, Main GT Road, Near Nasir Pur Phatak, Peshawar, Pakistan.",
    people: contactPeople,
    // The first supplied contact is used where space allows only one number.
    primary: contactPeople[0],
    email: "support@abdulsamienterprises.com",
    hours: "Monday–Friday, 9:00am–5:00pm PKT",
    onlineOrders: "Online orders anytime",
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
