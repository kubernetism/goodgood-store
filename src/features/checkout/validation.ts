import { hasErrors, isEmail, isPhone, type FieldErrors, type ValidationResult } from "@/lib/forms";

export const paymentMethods = [
  { value: "check", label: "Check payments" },
  { value: "cod", label: "Cash on delivery" },
  { value: "apple-pay", label: "Apple Pay" },
  { value: "paypal", label: "PayPal" },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]["value"];

export const countries = [
  // We ship across Pakistan; the others are left from the template pending a delivery-area decision.
  { value: "PK", label: "Pakistan" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
] as const;

export const checkoutFields = [
  "firstName",
  "lastName",
  "company",
  "phone",
  "email",
  "country",
  "street",
  "apartment",
  "city",
  "state",
  "zip",
  "notes",
  "paymentMethod",
] as const;

export type CheckoutField = (typeof checkoutFields)[number] | "cart";

export type BillingDetails = {
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string;
  email: string;
  country: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  zip: string;
  notes: string | null;
  paymentMethod: PaymentMethod;
};

const REQUIRED_MESSAGES = {
  firstName: "Please enter your first name.",
  lastName: "Please enter your last name.",
  street: "Please enter your street address.",
  city: "Please enter your town or city.",
  state: "Please enter your state or region.",
} as const;

export function validateBilling(
  input: Record<(typeof checkoutFields)[number], string>,
): ValidationResult<CheckoutField, BillingDetails> {
  const errors: FieldErrors<CheckoutField> = {};

  for (const [field, message] of Object.entries(REQUIRED_MESSAGES) as Array<
    [keyof typeof REQUIRED_MESSAGES, string]
  >) {
    if (!input[field]) errors[field] = message;
    else if (input[field].length > 120) errors[field] = "Please keep this under 120 characters.";
  }

  if (!input.phone) errors.phone = "Please enter a phone number for the courier.";
  else if (!isPhone(input.phone)) errors.phone = "Enter a valid phone number.";

  if (!input.email) errors.email = "Please enter your email address.";
  else if (!isEmail(input.email)) errors.email = "Enter an email address like name@example.com.";

  const country = countries.find((option) => option.value === input.country);
  if (!country) errors.country = "Please select your country.";

  if (!/^[A-Za-z0-9 -]{3,10}$/.test(input.zip)) errors.zip = "Enter a valid postal or ZIP code.";

  if (input.notes.length > 500) errors.notes = "Order notes must be 500 characters or fewer.";

  const payment = paymentMethods.find((option) => option.value === input.paymentMethod);
  if (!payment) errors.paymentMethod = "Please choose a payment method.";

  if (hasErrors(errors) || !country || !payment) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      company: input.company || null,
      phone: input.phone,
      email: input.email,
      country: country.value,
      street: input.street,
      apartment: input.apartment || null,
      city: input.city,
      state: input.state,
      zip: input.zip,
      notes: input.notes || null,
      paymentMethod: payment.value,
    },
  };
}
