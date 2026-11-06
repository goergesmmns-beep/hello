import { listings as seed, type Listing } from "@/content/listings";
import { getSetting, setSetting } from "./store";

/** Listings live in the database once edited. Until then, and if the database is unreachable, the starter list is used. */
export async function catalog(): Promise<Listing[]> {
  try { return (await getSetting<Listing[]>("catalog")) ?? seed; } catch { return seed; }
}
export const isOpen = (l: Listing) => l.status === "available" || l.status === "offers";
export const isPublic = (l: Listing) => l.status !== "draft" && l.status !== "sold";
/** Public pages never get deal room content, floors or rules. */
const strip = ({ room, ...l }: Listing): Listing => { void room; return l; };
export async function publicListings() { return (await catalog()).filter(isPublic).map(strip); }
export async function soldListings() { return (await catalog()).filter((l) => l.status === "sold").map(strip); }
export async function findListing(slug: string) { return (await catalog()).find((l) => l.slug === slug); }
export async function saveListing(l: Listing) {
  const all = await catalog();
  await setSetting("catalog", all.some((x) => x.slug === l.slug) ? all.map((x) => (x.slug === l.slug ? l : x)) : [l, ...all]);
}
export async function uniqueSlug(title: string) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "listing";
  const taken = new Set((await catalog()).map((l) => l.slug));
  let s = base, n = 2;
  while (taken.has(s)) s = `${base}-${n++}`;
  return s;
}
