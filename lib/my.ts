import { currentUser, type User } from "./accounts";
import { redirect } from "next/navigation";
import { allBuyers } from "./store";
import { subsFor } from "./seller";
import { publicListings } from "./catalog";
import type { Buyer } from "./types";
/** The signed-in person, or a trip to the login page. */
export async function me(next = "/account"): Promise<User> {
  const u = await currentUser(); if (!u) redirect(`/login?next=${encodeURIComponent(next)}`); return u;
}
export async function myDeals(u: User) { return (await allBuyers()).filter((b) => b.email.toLowerCase() === u.email && !b.demo).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function myCounts(u: User) { const [d, s] = await Promise.all([myDeals(u), subsFor(u.id)]); return { deals: d.length, saved: u.saved.length, listings: s.length }; }

/** Deals waiting on the buyer, not on an advisor. */
export const needsMe = (b: Buyer) => !b.archived && (b.stage === "inquiry" || b.stage === "nda" || b.stage === "capacity" || b.funds?.status === "more");
export const liveFunds = (deals: Buyer[]) => deals.filter((d) => d.funds?.status === "verified" && (d.funds.expiresAt ?? "") > new Date().toISOString()).sort((a, b) => (b.funds!.verifiedUsd ?? 0) - (a.funds!.verifiedUsd ?? 0))[0];
export function profileDone(u: User) { const f = [u.phone, u.company, u.linkedin, u.location, u.buyer?.type, u.buyer?.budget, u.buyer?.sectors?.length, u.buyer?.funding, u.buyer?.about]; return Math.round((f.filter(Boolean).length / f.length) * 100); }
export async function buyerCounts(u: User) {
  const [deals, list] = await Promise.all([myDeals(u), publicListings()]); const verified = !!liveFunds(deals);
  return { open: list.filter((l) => l.status !== "pending").length, deals: deals.filter((d) => !d.archived).length, action: deals.filter(needsMe).length, saved: u.saved.filter((s) => list.some((l) => l.slug === s)).length, searches: (u.searches ?? []).length, readiness: Math.round(profileDone(u) * 0.8 + (verified ? 20 : 0)), verified };
}
