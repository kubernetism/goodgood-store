import { contactServices, type ContactService } from "./validation";

/*
 * Copy for the topic picker. Values and labels come from validation.ts (they
 * are stored with each message), so the admin inbox and this page agree.
 */

export type ContactTopic = {
  value: ContactService;
  label: string;
  /** One line under the label in the picker. */
  description: string;
  /** Guides what to write once the topic is chosen. */
  messageHint: string;
  /** Completes "a question about …"; null for "Something else". */
  phrase: string | null;
};

const details: Record<ContactService, Omit<ContactTopic, "value" | "label">> = {
  "home-delivery": {
    phrase: "an order or delivery",
    description: "Delivery, a parcel or an order you've placed",
    messageHint: "Include your order number if you have one.",
  },
  "bulk-orders": {
    phrase: "wholesale and bulk honey",
    description: "Shops, restaurants, distributors and export",
    messageHint: "Tell us the honey variety, quantity (kg or jars) and delivery city or country.",
  },
  "gift-boxes": {
    phrase: "corporate and wedding gifts",
    description: "Gifts for staff, clients, weddings and Eid",
    messageHint: "Tell us the occasion, how many gifts and the date you need them.",
  },
  "farm-partnership": {
    phrase: "becoming a partner beekeeper",
    description: "You keep bees and want to work with us",
    messageHint: "Tell us where your apiary is, how many hives you keep and what your bees forage on.",
  },
  other: {
    phrase: null,
    description: "Anything we haven't listed",
    messageHint: "Tell us what you need and we'll point you in the right direction.",
  },
};

export const contactTopics: ReadonlyArray<ContactTopic> = contactServices.map((service) => ({
  value: service.value,
  label: service.label,
  ...details[service.value],
}));

/** Narrow untrusted input (form values, URLs) to a known service, else null. */
export function parseContactService(value: unknown): ContactService | null {
  return contactServices.find((option) => option.value === value)?.value ?? null;
}

/** Message hint before a topic is chosen. */
export const DEFAULT_MESSAGE_HINT = "At least 10 characters.";

export function messageHintFor(service: ContactService | null): string {
  return service ? details[service].messageHint : DEFAULT_MESSAGE_HINT;
}

/** Element id of a topic's radio; `/contact#enquiry-bulk-orders` deep-links to it. */
export function topicAnchorId(service: ContactService): string {
  return `enquiry-${service}`;
}

/** Topic named by a location hash such as "#enquiry-gift-boxes", else null. */
export function topicFromHash(hash: string): ContactService | null {
  const match = /^#enquiry-([a-z-]+)$/.exec(hash);
  return contactServices.find((service) => service.value === match?.[1])?.value ?? null;
}

/** e.g. "wholesale and bulk honey"; null for "Something else". */
export function topicPhrase(service: ContactService): string | null {
  return details[service].phrase;
}

/** "0 / 2,000", "4 more characters needed", "150 characters left", "Character limit reached". */
export function messageCounterText(length: number, min: number, max: number): string {
  if (length >= max) return "Character limit reached";
  if (length > 0 && length < min) return `${min - length} more ${min - length === 1 ? "character" : "characters"} needed`;
  const left = max - length;
  if (left <= 200) return `${left.toLocaleString("en-US")} ${left === 1 ? "character" : "characters"} left`;
  return `${length.toLocaleString("en-US")} / ${max.toLocaleString("en-US")}`;
}

/** Screen-reader announcements only at a few thresholds, so typing stays quiet. */
export function messageCounterAnnouncement(length: number, max: number): string {
  if (length >= max) return "Character limit reached";
  const left = max - length;
  if (left <= 50) return "50 characters left";
  if (left <= 200) return "200 characters left";
  return "";
}
