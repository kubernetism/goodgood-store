import { normalizePakistaniMobile } from "@/features/checkout/validation";
import { hasErrors, isEmail, type FieldErrors, type ValidationResult } from "@/lib/forms";

export const contactServices = [
  { value: "home-delivery", label: "Order or delivery question" },
  { value: "bulk-orders", label: "Wholesale & bulk honey" },
  { value: "gift-boxes", label: "Corporate & wedding gifts" },
  { value: "farm-partnership", label: "Become a partner beekeeper" },
  { value: "other", label: "Something else" },
] as const;

export type ContactService = (typeof contactServices)[number]["value"];

export const contactFields = ["name", "email", "service", "phone", "message", "consent"] as const;
export type ContactField = (typeof contactFields)[number];

/** Returned by the Server Action when one client sends too many messages; the form shows it as "Please wait". */
export const CONTACT_RATE_LIMIT_MESSAGE = "You've sent several messages recently. Please wait a few minutes before trying again.";

export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 2000;
export const NAME_MAX_LENGTH = 80;

export type ContactMessage = {
  name: string;
  email: string;
  service: ContactService;
  /** Optional; E.164 when given, e.g. +923001234567 (same rule as checkout). */
  phone: string | null;
  message: string;
};

/**
 * One rule per field, shared by the browser (inline feedback as people type)
 * and the Server Action (the authoritative check). Values arrive trimmed.
 */
const fieldRules: Record<ContactField, (value: string) => string | undefined> = {
  name: (value) => {
    if (value.length < 2) return "Please enter your name.";
    if (value.length > NAME_MAX_LENGTH) return `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  },
  email: (value) => {
    if (!value) return "Please enter your email address.";
    if (!isEmail(value)) return "Enter an email address like name@example.com.";
  },
  service: (value) => {
    if (!contactServices.some((option) => option.value === value)) return "Choose what your message is about.";
  },
  phone: (value) => {
    if (value && !normalizePakistaniMobile(value)) return "Enter a Pakistani mobile number, e.g. 0300 1234567 or +92 300 1234567.";
  },
  message: (value) => {
    if (value.length < MESSAGE_MIN_LENGTH) return `Please tell us a little more (at least ${MESSAGE_MIN_LENGTH} characters).`;
    if (value.length > MESSAGE_MAX_LENGTH) return "Message must be 2,000 characters or fewer.";
  },
  consent: (value) => {
    if (value !== "on") return "Please agree to the privacy policy so we can reply.";
  },
};

/** Error for one field, or undefined when it is valid. Trims like readFields does. */
export function validateContactField(field: ContactField, value: string): string | undefined {
  return fieldRules[field](value.trim());
}

export function validateContact(
  input: Record<ContactField, string>,
): ValidationResult<ContactField, ContactMessage> {
  const errors: FieldErrors<ContactField> = {};
  for (const field of contactFields) {
    const error = fieldRules[field](input[field]);
    if (error) errors[field] = error;
  }

  const service = contactServices.find((option) => option.value === input.service);
  if (hasErrors(errors) || !service) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      name: input.name,
      email: input.email,
      service: service.value,
      phone: input.phone ? normalizePakistaniMobile(input.phone) : null,
      message: input.message,
    },
  };
}
