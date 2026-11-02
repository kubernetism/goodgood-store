/*
 * The thank-you celebration plays once per order. The order number is kept in
 * sessionStorage, so remounting the confirmation (React remounts, a restored
 * tab) shows the resting comb instead of replaying it. Storage can be missing
 * or throw (private mode, blocked site data): the celebration then plays.
 */

type SessionLike = Pick<Storage, "getItem" | "setItem">;
type GetStorage = () => SessionLike | null | undefined;

export type CelebrationPhase = "play" | "rest";

export const CELEBRATED_ORDER_KEY = "store:order-celebrated";

/** Lazy, so importing this module never touches `window` (prerender, tests). */
export function browserSession(): SessionLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function hasCelebrated(getStorage: GetStorage, orderNumber: string): boolean {
  try {
    return getStorage()?.getItem(CELEBRATED_ORDER_KEY) === orderNumber;
  } catch {
    return false;
  }
}

export function markCelebrated(getStorage: GetStorage, orderNumber: string): void {
  try {
    getStorage()?.setItem(CELEBRATED_ORDER_KEY, orderNumber);
  } catch {
    // Quota or access errors: worst case, a remount plays it again.
  }
}

export function initialCelebrationPhase(getStorage: GetStorage, orderNumber: string): CelebrationPhase {
  return hasCelebrated(getStorage, orderNumber) ? "rest" : "play";
}
