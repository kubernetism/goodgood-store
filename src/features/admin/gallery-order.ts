/* Pure ordering helpers for the product gallery picker (unit tested). */

/** Moves the item at `index` by `delta` places; out-of-range moves are no-ops. */
export function moveItem<T>(items: ReadonlyArray<T>, index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return [...items];
  const next = [...items];
  const [item] = next.splice(index, 1);
  if (item !== undefined) next.splice(target, 0, item);
  return next;
}

/**
 * Keeps the current order for images that stay selected, drops deselected
 * ones and appends new ones in the order they were picked. No duplicates.
 */
export function mergeSelection(current: ReadonlyArray<string>, chosen: ReadonlyArray<string>): string[] {
  const chosenSet = new Set(chosen);
  const kept = current.filter((id) => chosenSet.has(id));
  const added = chosen.filter((id, index) => !current.includes(id) && chosen.indexOf(id) === index);
  return [...kept, ...added];
}
