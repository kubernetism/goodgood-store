"use client";

import { startTransition, useEffect } from "react";
import { markMessageOpened } from "./message-actions";

/**
 * Marks an unread message as read once the admin has opened it. Runs after
 * mount so link prefetching can never mark messages read.
 */
export function MarkMessageRead({ id }: { id: string }) {
  useEffect(() => {
    startTransition(() => markMessageOpened(id));
  }, [id]);
  return null;
}
