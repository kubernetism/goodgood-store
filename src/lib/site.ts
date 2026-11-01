const contactPeople = [
  { name: "Salman Sami", phoneDisplay: "0311-9000985", phoneHref: "tel:+923119000985" },
  { name: "M.D Basit Khan", phoneDisplay: "0319-9073330", phoneHref: "tel:+923199073330" },
  { name: "Mubashir Khan", phoneDisplay: "0315-9021627", phoneHref: "tel:+923159021627" },
] as const;

/** Site-wide configuration. Social profile URLs still await confirmation. */
export const siteConfig = {
  /** Short brand name for tight spaces (title template, social labels). */
  name: "Abdul Sami Honey",
  legalName: "Honey by Abdul Sami Enterprises",
  titleTagline: "Honey in Pakistan",
  tagline: "Raw, single-origin honey from Pakistani beekeepers, bottled with care.",
  description:
    "Shop raw, lab-tested honey and honeycomb in Pakistan. Contact Abdul Sami Honey Enterprises in Peshawar for import and export enquiries.",
  url: "https://www.abdulsamienterprises.com",
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
    /** The same hours, structured for the contact page's open/closed status and JSON-LD (kept in sync by a test). */
    openingHours: { days: [1, 2, 3, 4, 5], opens: 9 * 60, closes: 17 * 60 },
    onlineOrders: "Online orders anytime",
  },
  socials: [
    { network: "facebook", label: "Facebook", href: "https://facebook.com" },
    { network: "instagram", label: "Instagram", href: "https://instagram.com" },
    { network: "youtube", label: "YouTube", href: "https://youtube.com" },
    { network: "x", label: "X (Twitter)", href: "https://x.com" },
  ],
} as const;

export type SocialNetwork = "facebook" | "x" | "instagram" | "linkedin" | "dribbble" | "youtube";

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
    children: [{ label: "All Honey", href: "/shop" }],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
