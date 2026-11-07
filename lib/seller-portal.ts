import { cookies } from "next/headers";
import type { User } from "./accounts";
import { findListing } from "./catalog";
import { subLabels, subsFor, type SellerListing } from "./seller";
import { allBuyers } from "./store";
import type { Buyer } from "./types";
import { viewsFor } from "./views";

export const subTone: Record<string, string> = { draft: "var(--c-gray)", submitted: "var(--c-blue)", review: "var(--c-purple)", changes: "var(--c-orange)", approved: "var(--c-green)", rejected: "var(--destructive)", live: "var(--c-green)" };
export const subTitle = (s: SellerListing) => s.business.publicTitle || s.business.name || "Untitled draft";
const liveStatus = ["available", "offers", "pending"];
/** Buyers are shown to sellers by a short code, never by name. */
export const alias = (b: Buyer) => `Buyer ${b.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
export const routeName: Record<string, string> = { own: "Own capital", financing: "Financing", company: "Strategic acquirer", letter: "Lender letter" };
export const sellerStage = (b: Buyer) => b.stage === "call" ? "Call requested" : b.stage === "cim" ? "In the deal room" : b.stage === "review" ? "Advisor review" : b.nda ? "NDA signed" : "Requested access";
export const unreadFor = (s: SellerListing) => { const lastMine = [...s.messages].reverse().find((m) => m.from === "seller")?.at ?? ""; return s.messages.filter((m) => m.from === "advisor" && m.at > lastMine).length; };

/** The business the seller is looking at, everything about it, and the switcher list. */
export async function sellerCtx(u: User) {
  const subs = await subsFor(u.id); const id = (await cookies()).get("wb_listing")?.value;
  const cur = subs.find((s) => s.id === id) ?? subs.find((s) => s.listingSlug) ?? subs[0];
  const listing = cur?.listingSlug ? await findListing(cur.listingSlug) : undefined; const live = !!listing && liveStatus.includes(listing.status);
  const buyers = listing ? (await allBuyers()).filter((b) => b.listingSlug === listing.slug && !b.archived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  const views = listing ? await viewsFor(listing.slug) : null;
  const label = (s: SellerListing) => (s.listingSlug && s === cur && live ? "Live" : subLabels[s.status]);
  const items = subs.map((s) => ({ id: s.id, title: subTitle(s), status: s.status, label: label(s), tone: subTone[s === cur && live ? "live" : s.status] }));
  const offers = buyers.flatMap((b) => (b.offers ?? []).map((o) => ({ ...o, buyer: b })));
  return { subs, cur, listing, live, buyers, views, items, current: items.find((x) => x.id === cur?.id), offers, badges: { buyers: buyers.length, offers: offers.filter((o) => o.status === "Submitted" || o.status === "Countered").length, unread: cur ? unreadFor(cur) : 0 } };
}
