import type { Metadata, Viewport } from "next";
import { Sansation } from "next/font/google";
import { metadataBaseUrl } from "@/lib/metadata-base";
import { baseOpenGraph } from "@/lib/social-metadata";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Sansation is the only typeface on the site and in the admin. next/font serves
// it locally, so visitors never request a Google stylesheet.
//
// Each call preloads every file it declares, hence two: the upright regular and
// bold are preloaded because nearly all text uses them, and the italic (quotes
// only) downloads when a page actually renders it. Weight 300 is not used.
const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: "normal",
  variable: "--font-sansation",
  display: "swap",
  // This Next version has no metrics for Sansation; globals.css declares a
  // size-adjusted "Sansation Fallback" by hand instead.
  adjustFontFallback: false,
  fallback: ["Sansation Fallback", "Arial", "sans-serif"],
});
const sansationItalic = Sansation({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-sansation-italic",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Sansation Fallback", "Arial", "sans-serif"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: `${siteConfig.legalName} | ${siteConfig.titleTagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.legalName,
  openGraph: baseOpenGraph,
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // Matches the honey header on the home page.
  themeColor: "#f7c948",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser appearance extensions may add styles to the root before React hydrates.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sansation.variable} ${sansationItalic.variable} antialiased`}
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
