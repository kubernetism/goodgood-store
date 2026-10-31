import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./admin.css";

// Admin type: Plex Sans for UI and body, Plex Mono for identifiers (order
// numbers, slugs, phones). Display headings reuse the root layout's Fraunces
// (--font-fraunces), so the admin downloads no extra display font.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-admin-ui",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-admin-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { template: "%s · Admin · Honey by Abdul Sami", default: "Admin · Honey by Abdul Sami" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`admin-app ${plexSans.variable} ${plexMono.variable}`}>{children}</div>;
}
