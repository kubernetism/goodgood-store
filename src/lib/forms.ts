/**
 * Small, dependency-free form validation helpers shared by Client Components
 * (instant feedback) and Server Actions (the authoritative check).
 */

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export type ValidationResult<Field extends string, Data> =
  | { ok: true; data: Data }
  | { ok: false; fieldErrors: FieldErrors<Field> };

/** Result returned by form Server Actions to `useActionState`. */
export type FormState<Field extends string> =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors: FieldErrors<Field>;
      /** Echo of submitted values so React's post-action form reset keeps them. */
      values: Partial<Record<Field, string>>;
    };

// Pragmatic email check: one @, no spaces, a dot in the domain. Deliverability
// is the email provider's job; this only catches typos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isPhone(value: string): boolean {
  return PHONE_PATTERN.test(value) && (value.match(/\d/g)?.length ?? 0) >= 7;
}

/** Reads the named text fields from FormData as trimmed strings ("" when missing). */
export function readFields<Field extends string>(
  formData: FormData,
  fields: ReadonlyArray<Field>,
): Record<Field, string> {
  const result = {} as Record<Field, string>;
  for (const field of fields) {
    const value = formData.get(field);
    result[field] = typeof value === "string" ? value.trim() : "";
  }
  return result;
}

export function hasErrors<Field extends string>(errors: FieldErrors<Field>): boolean {
  return Object.keys(errors).length > 0;
}
