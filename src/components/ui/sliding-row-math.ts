/** Positive modulo also supports dragging backwards through the loop. */
export function wrapRowOffset(offset: number, cycle: number): number {
  return cycle > 0 ? ((offset % cycle) + cycle) % cycle : 0;
}

/** Reposition a card only after it has completely left the viewport. */
export function slidingItemTranslation(index: number, offset: number, step: number, count: number): number {
  if (step <= 0 || count <= 1) return 0;
  const position = wrapRowOffset(index * step - offset + step, count * step) - step;
  return position - index * step;
}
