/**
 * Nav badge text and accessible link name for a count ("Messages, 3 unread",
 * "Orders, 4 pending"). Null when there is nothing waiting.
 */
export function navBadge(label: string, waiting: number, noun = "unread"): { text: string; ariaLabel: string } | null {
  if (!Number.isInteger(waiting) || waiting <= 0) return null;
  return { text: waiting > 99 ? "99+" : String(waiting), ariaLabel: `${label}, ${waiting} ${noun}` };
}
