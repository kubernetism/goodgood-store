"use client";

import { Printer } from "lucide-react";

export function PrintOrderButton() {
  return <button type="button" className="admin-button secondary" onClick={() => window.print()}><Printer aria-hidden="true" />Print shipping details</button>;
}
