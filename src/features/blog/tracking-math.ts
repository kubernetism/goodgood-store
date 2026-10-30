/** Active time is bounded by tab visibility, article visibility and the idle timeout. */
export function activeElapsedMs(lastTick: number, now: number, lastActivity: number, visible: boolean, inView: boolean, idleMs: number): number {
  if (!visible || !inView) return 0;
  return Math.max(0, Math.min(now, lastActivity + idleMs) - lastTick);
}
