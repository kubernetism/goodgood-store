/** Joins truthy class names. Deliberately tiny: callers avoid conflicting utilities. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
