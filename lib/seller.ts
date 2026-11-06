import { randomUUID } from "crypto";
import { notifyAdvisors, sendMail, siteUrl } from "./mail";
import { getRecord, listRecords, putRecord } from "./store";

export type SubStatus = "draft" | "submitted" | "review" | "changes" | "approved" | "rejected";
export const subLabels: Record<SubStatus, string> = { draft: "Draft", submitted: "Submitted", review: "In review", changes: "Changes requested", approved: "Approved", rejected: "Not accepted" };
export type SellerDoc = { fileId: string; name: string; folder: string; at: string };
export type SellerListing = {
  id: string; ownerId: string; ownerEmail: string; ownerName: string; status: SubStatus; createdAt: string; updatedAt: string; submittedAt?: string;
  business: { name?: string; url?: string; publicTitle?: string; category?: string; model?: string; founded?: string; location?: string; team?: string; ownerHours?: string; description?: string; customers?: string };
  financials: { period: string; revenue: number; sde: number }[];
  highlights: string[]; growth: string[];
  sale: { reason?: string; transition?: string; asking?: number; structure?: string[]; timeline?: string; notes?: string };
  docs: SellerDoc[]; confirm?: { owner: boolean; accurate: boolean; at: string; name: string };
  checklist: Record<string, boolean>;
  messages: { id: string; at: string; from: "advisor" | "seller"; name: string; text: string }[];
  history: { at: string; status: SubStatus; note?: string }[];
  listingSlug?: string;
};
export const checks = [["owner", "Ownership confirmed on a call"], ["financials", "Financials reviewed against statements"], ["traffic", "Revenue sources verified in the accounts"], ["agreement", "Listing agreement signed"], ["valuation", "Valuation and asking price agreed"]] as const;

export const getSub = (id: string) => getRecord<SellerListing>("seller-listing", id);
export const allSubs = () => listRecords<SellerListing>("seller-listing");
export async function subsFor(ownerId: string) { return (await allSubs()).filter((s) => s.ownerId === ownerId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function saveSub(s: SellerListing) { s.updatedAt = new Date().toISOString(); await putRecord("seller-listing", s.id, s); return s; }
export function blankSub(u: { id: string; email: string; name: string }): SellerListing {
  const now = new Date().toISOString();
  return { id: randomUUID(), ownerId: u.id, ownerEmail: u.email, ownerName: u.name, status: "draft", createdAt: now, updatedAt: now, business: {}, financials: [], highlights: [], growth: [], sale: {}, docs: [], checklist: {}, messages: [], history: [{ at: now, status: "draft" }] };
}
/** What still blocks submission, in plain words. */
export function missing(s: SellerListing) {
  const m: string[] = []; const b = s.business;
  if (!b.name || !b.category || !b.model || !b.description || (b.description?.length ?? 0) < 80) m.push("Business details");
  if (!b.publicTitle) m.push("Public listing title");
  if (!s.financials.length || s.financials.some((f) => !f.period || !(f.revenue > 0))) m.push("At least one year of financials");
  if (!s.sale.reason) m.push("Reason for selling");
  if (!s.docs.some((d) => d.folder === "Financials")) m.push("A financial document (P&L or tax return)");
  return m;
}
export async function setStatus(s: SellerListing, status: SubStatus, note?: string, by: "advisor" | "seller" = "advisor") {
  s.status = status; s.history = [...s.history, { at: new Date().toISOString(), status, note }];
  if (status === "submitted") { s.submittedAt = new Date().toISOString(); await notifyAdvisors(`New business submitted: ${s.business.publicTitle ?? s.business.name}`, `${s.ownerName} submitted a business for review.\n\n${siteUrl()}/admin/submissions/${s.id}`).catch(() => {}); }
  else if (by === "advisor") await sendMail(s.ownerEmail, `Your listing is ${status === "changes" ? "waiting for a few changes" : status === "approved" ? "approved" : status === "review" ? "in review" : "updated"}`, `Hi ${s.ownerName.split(" ")[0]},\n\nYour submission "${s.business.publicTitle ?? s.business.name}" is now: ${subLabels[status]}.${note ? `\n\n${note}` : ""}\n\nSee it here:\n${siteUrl()}/account/sell/${s.id}\n\nWestbound Road`).catch(() => {});
  return saveSub(s);
}
export async function postMessage(s: SellerListing, from: "advisor" | "seller", name: string, text: string) {
  s.messages = [...s.messages, { id: randomUUID(), at: new Date().toISOString(), from, name, text }];
  if (from === "seller") await notifyAdvisors(`Message from ${s.ownerName}`, `${text}\n\n${siteUrl()}/admin/submissions/${s.id}`).catch(() => {});
  else await sendMail(s.ownerEmail, "New message from your Westbound Road advisor", `${text}\n\nReply here:\n${siteUrl()}/account/sell/${s.id}\n\nWestbound Road`).catch(() => {});
  return saveSub(s);
}

/** Turns an approved submission into a hidden draft listing the advisor can polish and publish. */
export async function createListingFrom(s: SellerListing) {
  const { uniqueSlug, saveListing } = await import("./catalog"); const { saveRule } = await import("./rules"); const { getFile, saveFile } = await import("./store");
  const b = s.business; const last = s.financials.at(-1); const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const slug = await uniqueSlug(b.publicTitle || b.category || "listing"); const asking = s.sale.asking ?? null;
  const l = {
    slug, title: b.publicTitle || "New listing", headline: b.publicTitle || "New listing", band: (asking ?? 0) >= 1e6 ? "over" as const : "under" as const, category: b.category || "Other", status: "draft" as const,
    askLabel: asking ? usd(asking) : "Accepting offers", askUsd: asking,
    metrics: last ? [{ label: `${last.period} revenue`, value: usd(last.revenue) }, { label: `${last.period} SDE`, value: usd(last.sde) }] : [{ label: "Asking", value: asking ? usd(asking) : "Offers" }],
    summary: (b.description ?? "").slice(0, 300), highlights: s.highlights,
    body: [{ heading: "The business", text: b.description ?? "" }, ...(b.customers ? [{ heading: "Customers", text: b.customers }] : [])],
    gate: "after_review" as const, floorUsd: asking ? Math.round(asking * 0.1) : null, idealBuyer: "any" as const,
    facts: [["Business model", b.model], ["Founded", b.founded], ["Location", b.location], ["Team", b.team], ["Owner time", b.ownerHours ? `${b.ownerHours} hours a week` : undefined]].filter((x): x is [string, string] => !!x[1]).map(([label, value]) => ({ label, value })),
    growth: s.growth, revenueUsd: last?.revenue || undefined, earningsUsd: last?.sde || undefined,
    room: { financials: s.financials, reason: s.sale.reason, transition: s.sale.transition, structure: s.sale.structure?.length ? `Seller is open to: ${s.sale.structure.join(", ")}.` : undefined },
  };
  await saveListing(l); await saveRule(slug, { gate: l.gate, floorUsd: l.floorUsd });
  for (const d of s.docs.filter((x) => x.name.toLowerCase().endsWith(".pdf"))) { const f = await getFile(d.fileId); if (f) await saveFile({ ...f, id: `room:${slug}:${randomUUID()}`, kind: "room", buyerId: slug, name: `${d.folder === "Tax returns" ? "Financials" : d.folder}::${d.name}` }); }
  s.listingSlug = slug; return slug;
}
