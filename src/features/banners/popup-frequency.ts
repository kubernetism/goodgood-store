/*
 * "Once per visit" for the landing-page pop-up: a flag in sessionStorage, so
 * a new tab or a new browser session shows it again. Storage can be missing
 * or throw (private mode, blocked site data, sandboxed previews); the
 * in-memory set then still limits it to once per page life.
 */

type SessionLike = Pick<Storage, "getItem" | "setItem">;

export type SeenStore = {
  hasSeen(id: string): boolean;
  markSeen(id: string): void;
};

const KEY_PREFIX = "store:popup-seen:";

export function popupSeenKey(id: string): string {
  return `${KEY_PREFIX}${id}`;
}

/** `getStorage` is called lazily, so creating the store never touches `window`. */
export function createSeenStore(getStorage: () => SessionLike | null | undefined): SeenStore {
  const seenThisPage = new Set<string>();

  return {
    hasSeen(id) {
      if (seenThisPage.has(id)) return true;
      try {
        return getStorage()?.getItem(popupSeenKey(id)) === "1";
      } catch {
        // Unreadable storage counts as "not seen"; the memory set covers the rest.
        return false;
      }
    },
    markSeen(id) {
      seenThisPage.add(id);
      try {
        getStorage()?.setItem(popupSeenKey(id), "1");
      } catch {
        // Quota or access errors: the memory set still prevents a repeat on this page.
      }
    },
  };
}
