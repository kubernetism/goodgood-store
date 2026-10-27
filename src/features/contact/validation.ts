import { hasErrors, isEmail, isPhone, type FieldErrors, type ValidationResult } from "@/lib/forms";

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

export type ContactMessage = {
  name: string;
  email: string;
  service: ContactService;
  phone: string | null;
  message: string;
};

export function validateContact(
  input: Record<ContactField, string>,
): ValidationResult<ContactField, ContactMessage> {
  const errors: FieldErrors<ContactField> = {};

  if (input.name.length < 2) errors.name = "Please enter your name.";
  else if (input.name.length > 80) errors.name = "Name must be 80 characters or fewer.";

  if (!input.email) errors.email = "Please enter your email address.";
  else if (!isEmail(input.email)) errors.email = "Enter an email address like name@example.com.";

  const service = contactServices.find((option) => option.value === input.service);
  if (!service) errors.service = "Please choose the service you need.";

  if (input.phone && !isPhone(input.phone)) errors.phone = "Enter a valid phone number, e.g. +1 212 555 0189.";

  if (input.message.length < 10) errors.message = "Please tell us a little more (at least 10 characters).";
  else if (input.message.length > 2000) errors.message = "Message must be 2,000 characters or fewer.";

  if (input.consent !== "on") errors.consent = "Please agree to the privacy policy so we can reply.";

  if (hasErrors(errors) || !service) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      name: input.name,
      email: input.email,
      service: service.value,
      phone: input.phone || null,
      message: input.message,
    },
  };
}
