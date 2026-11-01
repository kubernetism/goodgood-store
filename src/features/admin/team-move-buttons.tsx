"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useFormStatus } from "react-dom";

/**
 * Up/down submit buttons inside a moveTeamMember form. Edge buttons are
 * disabled; while a move runs both ignore repeat taps (aria-disabled keeps
 * them announced and focusable).
 */
export function TeamMoveButtons({ name, isFirst, isLast }: { name: string; isFirst: boolean; isLast: boolean }) {
  const { pending } = useFormStatus();
  const guard = (event: React.MouseEvent) => { if (pending) event.preventDefault(); };
  return <div className="admin-team-move">
    <button type="submit" name="direction" value="up" className="admin-icon-button" disabled={isFirst} aria-disabled={pending || undefined} aria-label={`Move ${name} up`} title="Move up" onClick={guard}><ArrowUp aria-hidden="true" /></button>
    <button type="submit" name="direction" value="down" className="admin-icon-button" disabled={isLast} aria-disabled={pending || undefined} aria-label={`Move ${name} down`} title="Move down" onClick={guard}><ArrowDown aria-hidden="true" /></button>
  </div>;
}
