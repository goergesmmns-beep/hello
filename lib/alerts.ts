import type { Listing } from "@/content/listings";
import { allUsers, saveUser, type SavedSearch } from "./accounts";
import { sendMail, siteUrl } from "./mail";

/** Same rules as the marketplace filters, so an alert matches what the buyer saw. */
export function matches(s: Pick<SavedSearch, "q" | "cat" | "price">, l: Listing) {
  if (s.cat && s.cat !== "all" && l.category !== s.cat) return false;
  if (s.price && s.price !== "any") { const [lo, hi] = s.price.split("-").map((x, i) => (x ? Number(x) : i ? Infinity : 0)); if (l.askUsd === null || l.askUsd < lo || l.askUsd >= hi) return false; }
  const q = (s.q ?? "").toLowerCase().trim(); return !q || `${l.title} ${l.headline} ${l.summary} ${l.category}`.toLowerCase().includes(q);
}
/** Emails every buyer whose saved search matches a newly opened listing. Each listing is sent once per search. */
export async function notifySearches(l: Listing) {
  if (l.status !== "available" && l.status !== "offers") return 0;
  let n = 0;
  for (const u of await allUsers()) {
    const hits = (u.searches ?? []).filter((s) => s.alerts && !(s.sent ?? []).includes(l.slug) && matches(s, l)); if (!hits.length) continue;
    for (const s of hits) s.sent = [...(s.sent ?? []), l.slug].slice(-200);
    await saveUser(u); n++;
    await sendMail(u.email, `New match: ${l.title}`, `Hi ${u.name.split(" ")[0]},\n\nA new business matches your saved search "${hits[0].name}":\n\n${l.title}\nAsking: ${l.askLabel}\n\n${l.summary}\n\nSee it in your buyer dashboard:\n${siteUrl()}/buyer/listings/${l.slug}\n\nManage alerts: ${siteUrl()}/buyer/searches\n\nWestbound Road`).catch(() => {});
  }
  return n;
}
