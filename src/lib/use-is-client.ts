"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False during prerender and hydration, true afterwards. Lets client-only data
 * (the localStorage cart) show a skeleton instead of a misleading empty state.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
