import { describe, expect, it } from "vitest";
import { CELEBRATED_ORDER_KEY, hasCelebrated, initialCelebrationPhase, markCelebrated } from "./celebration";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    values,
  };
}

const throwing = {
  getItem: () => { throw new Error("SecurityError"); },
  setItem: () => { throw new Error("QuotaExceededError"); },
};

describe("thank-you celebration plays once per order", () => {
  it("plays for a new order, then rests once it is marked", () => {
    const storage = memoryStorage();
    expect(initialCelebrationPhase(() => storage, "AS-1042")).toBe("play");
    markCelebrated(() => storage, "AS-1042");
    expect(storage.values.get(CELEBRATED_ORDER_KEY)).toBe("AS-1042");
    expect(initialCelebrationPhase(() => storage, "AS-1042")).toBe("rest");
  });

  it("plays again for the next order in the same session", () => {
    const storage = memoryStorage();
    markCelebrated(() => storage, "AS-1042");
    expect(hasCelebrated(() => storage, "AS-1043")).toBe(false);
    expect(initialCelebrationPhase(() => storage, "AS-1043")).toBe("play");
  });

  it("plays when storage is missing or throws, and never throws itself", () => {
    expect(initialCelebrationPhase(() => null, "AS-1042")).toBe("play");
    expect(initialCelebrationPhase(() => throwing, "AS-1042")).toBe("play");
    expect(() => markCelebrated(() => throwing, "AS-1042")).not.toThrow();
    const accessDenied = () => { throw new Error("SecurityError"); };
    expect(initialCelebrationPhase(accessDenied, "AS-1042")).toBe("play");
    expect(() => markCelebrated(accessDenied, "AS-1042")).not.toThrow();
  });
});
