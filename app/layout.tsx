import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({ src: "./fonts/schibsted.woff2", variable: "--font-schibsted", weight: "400 900", display: "swap" });
const mono = localFont({ src: "./fonts/geist-mono.woff2", variable: "--font-geist-mono", weight: "100 900", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Westbound Road | M&A Advisors for Digital Businesses", template: "%s | Westbound Road" },
  description: "Certified M&A advisors helping founders sell, buyers acquire and companies grow through acquisition, around the world.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
