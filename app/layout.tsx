import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({ src: "./fonts/schibsted.woff2", variable: "--font-schibsted", weight: "400 900", display: "swap" });
const mono = localFont({ src: "./fonts/geist-mono.woff2", variable: "--font-geist-mono", weight: "100 900", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Westbound Road | Sell-Side and Buy-Side M&A Advisors for Digital Businesses", template: "%s | Westbound Road" },
  description: "Sell-side and buy-side M&A advisory for digital businesses. Certified M&A advisors helping founders exit and companies grow through acquisition.",
  ...(process.env.TEST_MODE === "true" ? { robots: { index: false, follow: false } } : {}),
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
