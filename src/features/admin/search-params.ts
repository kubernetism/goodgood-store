/** A Next.js page `searchParams` value: repeated keys arrive as arrays. */
export type SearchParamValue = string | string[] | undefined;
export type RawSearchParams = Record<string, SearchParamValue>;

/** The first value of a query parameter (`?a=1&a=2` -> "1"), so pages never treat an array as a string. */
export function firstParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** A 1-based page number from the query string, clamped to 1..10000. */
export function pageNumber(input: string | undefined): number {
  const page = Number(input ?? 1);
  return Number.isInteger(page) ? Math.min(10000, Math.max(1, page)) : 1;
}
