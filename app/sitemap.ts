import type { MetadataRoute } from "next";
import { listings } from "@/content/listings";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ["", "/buy", "/sell", "/grow", "/valuation", "/team", "/about", "/success", "/media", "/referrals", "/contact", "/insights", ...listings.map((l) => `/buy/${l.slug}`)].map((p) => ({ url: base + p }));
}
