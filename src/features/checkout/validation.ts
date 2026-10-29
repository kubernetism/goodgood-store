import { hasErrors, isEmail, type FieldErrors, type ValidationResult } from "@/lib/forms";

/*
 * Checkout rules, shared by the form (instant feedback) and the placeOrder
 * Server Action (the authoritative check). We deliver within Pakistan only
 * and take cash on delivery only.
 */

export const paymentMethods = [{ value: "cod", label: "Cash on delivery" }] as const;
export type PaymentMethod = (typeof paymentMethods)[number]["value"];

export const DELIVERY_COUNTRY = "Pakistan";

export const provinces = [
  { value: "Punjab", label: "Punjab" },
  { value: "Sindh", label: "Sindh" },
  { value: "Khyber Pakhtunkhwa", label: "Khyber Pakhtunkhwa" },
  { value: "Balochistan", label: "Balochistan" },
  { value: "Islamabad Capital Territory", label: "Islamabad Capital Territory" },
  { value: "Gilgit-Baltistan", label: "Gilgit-Baltistan" },
  { value: "Azad Jammu and Kashmir", label: "Azad Jammu and Kashmir" },
] as const;

export type Province = (typeof provinces)[number]["value"];

export const checkoutFields = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "province",
  "city",
  "street",
  "apartment",
  "postalCode",
  "notes",
  "paymentMethod",
] as const;

export type CheckoutField = (typeof checkoutFields)[number] | "cart";

export type BillingDetails = {
  firstName: string;
  lastName: string;
  /** E.164, e.g. +923001234567. */
  phone: string;
  email: string | null;
  province: Province;
  city: string;
  street: string;
  apartment: string | null;
  postalCode: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
};

/**
 * Pakistani mobile numbers in any common form (0300 1234567, 0300-1234567,
 * +92 300 1234567, 0092..., 92...) -> "+923001234567". Couriers call or
 * WhatsApp the customer before delivering COD parcels, so a mobile is required.
 */
export function normalizePakistaniMobile(input: string): string | null {
  const compact = input.replace(/[\s().-]/g, "");
  const match = /^(?:\+92|0092|92|0)?(3\d{9})$/.exec(compact);
  return match ? `+92${match[1]}` : null;
}

/** "+923001234567" -> "+92 300 1234567". */
export function formatPakistaniMobile(e164: string): string {
  const match = /^\+92(3\d{2})(\d{7})$/.exec(e164);
  return match ? `+92 ${match[1]} ${match[2]}` : e164;
}

const REQUIRED_MESSAGES = {
  firstName: "Please enter your first name.",
  lastName: "Please enter your last name.",
  street: "Please enter your house number and street.",
  city: "Please enter your town or city.",
} as const;

const LIMITS = { firstName: 60, lastName: 60, street: 160, city: 60, apartment: 120 } as const;

export function validateBilling(
  input: Record<(typeof checkoutFields)[number], string>,
): ValidationResult<CheckoutField, BillingDetails> {
  const errors: FieldErrors<CheckoutField> = {};

  for (const [field, message] of Object.entries(REQUIRED_MESSAGES) as Array<
    [keyof typeof REQUIRED_MESSAGES, string]
  >) {
    if (!input[field]) errors[field] = message;
    else if (input[field].length > LIMITS[field]) errors[field] = `Please keep this under ${LIMITS[field]} characters.`;
  }
  if (input.apartment.length > LIMITS.apartment) errors.apartment = `Please keep this under ${LIMITS.apartment} characters.`;

  const phone = normalizePakistaniMobile(input.phone);
  if (!input.phone) errors.phone = "Please enter a mobile number for the courier.";
  else if (!phone) errors.phone = "Enter a Pakistani mobile number, e.g. 0300 1234567 or +92 300 1234567.";

  if (input.email && !isEmail(input.email)) errors.email = "Enter an email address like name@example.com.";

  const province = provinces.find((option) => option.value === input.province);
  if (!province) errors.province = "Please choose your province or territory.";

  if (input.postalCode && !/^\d{5}$/.test(input.postalCode)) {
    errors.postalCode = "Pakistani postal codes have 5 digits, e.g. 54000.";
  }

  if (input.notes.length > 500) errors.notes = "Order notes must be 500 characters or fewer.";

  const payment = paymentMethods.find((option) => option.value === input.paymentMethod);
  if (!payment) errors.paymentMethod = "Cash on delivery is the only payment method.";

  if (hasErrors(errors) || !phone || !province || !payment) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone,
      email: input.email ? input.email.toLowerCase() : null,
      province: province.value,
      city: input.city,
      street: input.street,
      apartment: input.apartment || null,
      postalCode: input.postalCode || null,
      notes: input.notes || null,
      paymentMethod: payment.value,
    },
  };
}
