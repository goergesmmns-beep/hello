import { currentUser, type User } from "./accounts";
import { redirect } from "next/navigation";
import { allBuyers } from "./store";
import { subsFor } from "./seller";
/** The signed-in person, or a trip to the login page. */
export async function me(next = "/account"): Promise<User> {
  const u = await currentUser(); if (!u) redirect(`/login?next=${encodeURIComponent(next)}`); return u;
}
export async function myDeals(u: User) { return (await allBuyers()).filter((b) => b.email.toLowerCase() === u.email && !b.demo).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function myCounts(u: User) { const [d, s] = await Promise.all([myDeals(u), subsFor(u.id)]); return { deals: d.length, saved: u.saved.length, listings: s.length }; }
