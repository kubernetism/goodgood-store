"use client";

import { useState, useTransition } from "react";
import { setProductVisibility } from "./actions";

export function ProductVisibility({ id, name, active, archived }: { id: string; name: string; active: boolean; archived: boolean }) {
  const [checked, setChecked] = useState(active);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function changeVisibility(next: boolean) {
    setChecked(next);
    setError("");
    startTransition(async () => {
      try {
        const result = await setProductVisibility(id, next);
        if (result.error) {
          setChecked(!next);
          setError(result.error);
        }
      } catch {
        setChecked(!next);
        setError("Could not update visibility. Please try again.");
      }
    });
  }

  return <div className="admin-product-visibility">
    <label><input type="checkbox" checked={checked} disabled={pending} onChange={(event) => changeVisibility(event.target.checked)} aria-label={`Show ${name} on the website`} /> <span>{checked ? "Active" : archived ? "Archived" : "Inactive"}</span></label>
    {pending && <span className="admin-muted" role="status">Saving…</span>}
    {error && <span className="admin-visibility-error" role="alert">{error}</span>}
  </div>;
}
