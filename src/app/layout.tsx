import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Parisienne } from "next/font/google";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Fraunces (headings, variable with the SOFT axis), Inter (body + UI) and
// Parisienne (logo wordmark only). All self-hosted by next/font.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-parisienne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.legalName} | ${siteConfig.titleTagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.legalName,
  openGraph: {
    type: "website",
    siteName: siteConfig.legalName,
    locale: "en_PK",
  },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  // Matches the honey header on the home page.
  themeColor: "#f7c948",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${parisienne.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-24 rounded-sm bg-strong px-4 py-3 text-sm font-semibold text-on-dark transition-transform duration-200 focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
