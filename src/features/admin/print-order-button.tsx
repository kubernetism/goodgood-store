"use client";

export function PrintOrderButton() {
  return <button type="button" className="admin-button secondary" onClick={() => window.print()}>Print shipping details</button>;
}
