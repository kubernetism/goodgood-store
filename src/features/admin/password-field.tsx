"use client";

import { useState } from "react";

/** Password input with an optional Show toggle. The autocomplete hint is unchanged. */
export function PasswordField({ id, describedBy }: { id: string; describedBy?: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="admin-password">
    <input id={id} name="password" type={visible ? "text" : "password"} autoComplete="current-password" required aria-describedby={describedBy} />
    <button type="button" className="admin-password-toggle" aria-pressed={visible} aria-controls={id} onClick={() => setVisible((value) => !value)}>Show<span className="sr-only"> password</span></button>
  </div>;
}
