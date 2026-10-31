"use client";

import { Check } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { setProductVisibility } from "./actions";

const SAVED_MS = 2000;

/** Website visibility switch for the products list. Saves immediately and confirms "Saved". */
export function ProductVisibility({ id, name, active, archived }: { id: string; name: string; active: boolean; archived: boolean }) {
  const [checked, setChecked] = useState(active);
  const [serverActive, setServerActive] = useState(active);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  // Follow the server when the product changes elsewhere (state adjusted during render).
  if (active !== serverActive) {
    setServerActive(active);
    setChecked(active);
  }

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), SAVED_MS);
    return () => window.clearTimeout(timer);
  }, [saved]);

  function changeVisibility(next: boolean) {
    setChecked(next);
    setError("");
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await setProductVisibility(id, next);
        if (result.error) {
          setChecked(!next);
          setError(result.error);
        } else {
          setSaved(true);
        }
      } catch {
        setChecked(!next);
        setError("Could not update visibility. Please try again.");
      }
    });
  }

  return <div className="admin-stack-sm">
    <label className="admin-switch">
      <input type="checkbox" checked={checked} disabled={pending} onChange={(event) => changeVisibility(event.target.checked)} aria-label={`Show ${name} on the website`} />
      <span>{checked ? "Shown on website" : archived ? "Archived" : "Hidden"}</span>
    </label>
    <span role="status" className={saved ? "admin-switch-status ok" : "admin-switch-status"}>
      {pending ? "Saving…" : saved ? <><Check aria-hidden="true" width={14} height={14} />Saved</> : ""}
    </span>
    {error && <span className="admin-field-error" role="alert">{error}</span>}
  </div>;
}
