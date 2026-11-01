import { moveItem } from "./gallery-order";

/* Pure ordering helpers for the Team list (unit tested). */

export type TeamMoveDirection = "up" | "down";

export function parseMoveDirection(value: string): TeamMoveDirection | null {
  return value === "up" || value === "down" ? value : null;
}

/**
 * Moves one member a place up or down in the displayed order and renumbers
 * everyone 0, 1, 2…, which also repairs ties and gaps left by older edits.
 * `rows` must already be in display order. Returns only the rows whose
 * sortOrder changes; empty when the member is missing or already at the edge.
 */
export function planTeamMove(
  rows: ReadonlyArray<{ id: string; sortOrder: number }>,
  id: string,
  direction: TeamMoveDirection,
): { id: string; sortOrder: number }[] {
  const index = rows.findIndex((row) => row.id === id);
  const delta = direction === "up" ? -1 : 1;
  const target = index + delta;
  if (index < 0 || target < 0 || target >= rows.length) return [];
  return moveItem(rows, index, delta).flatMap((row, position) => (row.sortOrder === position ? [] : [{ id: row.id, sortOrder: position }]));
}
