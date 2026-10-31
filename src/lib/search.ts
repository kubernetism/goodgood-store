/**
 * ILIKE pattern that matches `term` anywhere, literally. `%` and `_` are LIKE
 * wildcards and `\` is Postgres's default LIKE escape character, so all three
 * are escaped; otherwise searching "100%" or "a_b" would match far too much.
 */
export function containsPattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}
