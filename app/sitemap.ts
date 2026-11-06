import type { MetadataRoute } from "next";
import { publicListings } from "@/lib/catalog";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ["", "/buy", "/sell", "/grow", "/valuation", "/team", "/about", "/success", "/media", "/referrals", "/contact", "/insights", ...(await publicListings()).map((l) => `/buy/${l.slug}`)].map((p) => ({ url: base + p }));
}
