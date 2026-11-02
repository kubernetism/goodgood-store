import { describe, expect, it } from "vitest";
import { createSeenStore, popupSeenKey } from "./popup-frequency";

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const throwing = {
  getItem: () => {
    throw new DOMException("denied", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("full", "QuotaExceededError");
  },
};

describe("createSeenStore", () => {
  it("shows a pop-up until it is marked seen, then remembers it in session storage", () => {
    const storage = fakeStorage();
    const store = createSeenStore(() => storage);
    expect(store.hasSeen("a")).toBe(false);
    store.markSeen("a");
    expect(store.hasSeen("a")).toBe(true);
    expect(storage.data.get(popupSeenKey("a"))).toBe("1");
  });

  it("survives a reload in the same session (a new store over the same storage)", () => {
    const storage = fakeStorage();
    createSeenStore(() => storage).markSeen("a");
    expect(createSeenStore(() => storage).hasSeen("a")).toBe(true);
  });

  it("tracks each pop-up separately, so a replacement pop-up still shows", () => {
    const store = createSeenStore(() => fakeStorage());
    store.markSeen("old");
    expect(store.hasSeen("new")).toBe(false);
  });

  it("falls back to once per page life when storage throws", () => {
    const store = createSeenStore(() => throwing);
    expect(store.hasSeen("a")).toBe(false);
    expect(() => store.markSeen("a")).not.toThrow();
    expect(store.hasSeen("a")).toBe(true);
  });

  it("falls back when storage is unavailable or its getter throws", () => {
    const missing = createSeenStore(() => null);
    missing.markSeen("a");
    expect(missing.hasSeen("a")).toBe(true);

    const blocked = createSeenStore(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(blocked.hasSeen("a")).toBe(false);
    blocked.markSeen("a");
    expect(blocked.hasSeen("a")).toBe(true);
  });
});
