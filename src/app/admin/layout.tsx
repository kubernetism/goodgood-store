import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { template: "%s · Admin · Honey by Abdul Sami", default: "Admin · Honey by Abdul Sami" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-app">{children}</div>;
}
