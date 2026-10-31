/** A media item as image pickers see it. */
export type ImageOption = { id: string; alt: string; url: string };

/** Only the fields the pickers need (keeps the RSC payload small). */
export function toImageOptions(rows: ReadonlyArray<{ id: string; alt: string; url: string }>): ImageOption[] {
  return rows.map(({ id, alt, url }) => ({ id, alt, url }));
}
