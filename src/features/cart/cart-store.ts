import { useSyncExternalStore } from "react";
import { MAX_LINE_QUANTITY, parseCartLines, partitionCartLines, type CartLine } from "./pricing";

/*
 * Client-only cart persisted in localStorage (there is no backend yet).
 * Exposed through useSyncExternalStore so every island (header badge, product
 * buttons, cart page) stays in sync, including across browser tabs.
 */

// Renamed with the rebrand: old "broccoli.cart.v1" carts referenced grocery slugs.
const STORAGE_KEY = "abdulsami.cart.v1";
const EMPTY: CartLine[] = [];

// Used when storage is unavailable (private mode, blocked site data).
let memoryRaw: string | null = null;
let cachedRaw: string | null | undefined;
let cachedLines: CartLine[] = EMPTY;

const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryRaw;
  }
}

function getSnapshot(): CartLine[] {
  const raw = readRaw();
  // Same raw string -> same array reference, as useSyncExternalStore requires.
  if (raw === cachedRaw) return cachedLines;
  cachedRaw = raw;
  try {
    cachedLines = raw ? parseCartLines(JSON.parse(raw)) : EMPTY;
  } catch {
    cachedLines = EMPTY;
  }
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function write(lines: CartLine[]) {
  const raw = JSON.stringify(lines);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    memoryRaw = raw;
  }
  listeners.forEach((listener) => listener());
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(quantity)));
}

export const cartActions = {
  add(slug: string, quantity = 1) {
    const lines = getSnapshot();
    const existing = lines.find((line) => line.slug === slug);
    write(
      existing
        ? lines.map((line) =>
            line.slug === slug ? { ...line, quantity: clampQuantity(line.quantity + quantity) } : line,
          )
        : [...lines, { slug, quantity: clampQuantity(quantity) }],
    );
  },
  setQuantity(slug: string, quantity: number) {
    write(getSnapshot().map((line) => (line.slug === slug ? { ...line, quantity: clampQuantity(quantity) } : line)));
  },
  remove(slug: string) {
    write(getSnapshot().filter((line) => line.slug !== slug));
  },
  removeMany(slugs: ReadonlyArray<string>) {
    const removed = new Set(slugs);
    write(getSnapshot().filter((line) => !removed.has(line.slug)));
  },
  clear() {
    write([]);
  },
};

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartItemCount(availableSlugs: ReadonlyArray<string>): number {
  const { available } = partitionCartLines(useCartLines(), new Set(availableSlugs));
  return available.reduce((sum, line) => sum + line.quantity, 0);
}
