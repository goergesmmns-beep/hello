import { listings } from "@/content/listings";
import type { Buyer, Submission } from "./types";

const DAY = 864e5;
export const hoursSince = (iso: string, now = Date.now()) => (now - new Date(iso).getTime()) / 36e5;
export function ago(iso: string) {
  const h = hoursSince(iso);
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}
const reached = (b: Buyer, type: string) => b.events.some((e) => e.type === type);
const count = <T,>(items: T[], key: (t: T) => string | undefined) => {
  const m = new Map<string, number>();
  items.forEach((i) => { const k = key(i); if (k) m.set(k, (m.get(k) ?? 0) + 1); });
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};
export const routeLabels: Record<string, string> = { own: "Own capital", company: "Strategic", letter: "Bank or lender letter", financing: "Financing" };

export function analyze(all: Buyer[], subs: Submission[]) {
  const buyers = all.filter((b) => !b.archived);
  const now = Date.now();
  const funnel = [
    { label: "Inquiry", value: buyers.length },
    { label: "Profile complete", value: buyers.filter((b) => b.why).length },
    { label: "NDA signed", value: buyers.filter((b) => b.nda).length },
    { label: "CIM released", value: buyers.filter((b) => reached(b, "cim")).length },
    { label: "CIM opened", value: buyers.filter((b) => b.cimViews > 0).length },
    { label: "Call requested", value: buyers.filter((b) => b.cimViews > 0 && reached(b, "call")).length },
  ];
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * DAY); const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), value: buyers.filter((b) => b.createdAt.slice(0, 10) === key).length };
  });
  const toCim = buyers.flatMap((b) => { const e = b.events.find((x) => x.type === "cim"); return e ? [(new Date(e.at).getTime() - new Date(b.createdAt).getTime()) / 36e5] : []; }).sort((a, b) => a - b);
  const review = buyers.filter((b) => b.stage === "review").sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  return {
    buyers, review, funnel, daily,
    kpis: {
      total: buyers.length, newWeek: buyers.filter((b) => now - new Date(b.createdAt).getTime() < 7 * DAY).length,
      ndas: funnel[2].value, ndaRate: buyers.length ? Math.round((funnel[2].value / buyers.length) * 100) : 0,
      review: review.length, oldestReview: review[0]?.updatedAt,
      cims: funnel[3].value, calls: buyers.filter((b) => reached(b, "call")).length, warm: buyers.filter((b) => b.stage === "warm").length,
      medianToCim: toCim.length ? toCim[Math.floor(toCim.length / 2)] : null,
      inbox: subs.filter((s) => !s.handled).length,
    },
    sources: count(buyers, (b) => b.source),
    routes: count(buyers, (b) => (b.route ? routeLabels[b.route] : undefined)),
    byListing: listings.map((l) => {
      const r = buyers.filter((b) => b.listingSlug === l.slug);
      return { listing: l, inquiries: r.length, ndas: r.filter((b) => b.nda).length, cims: r.filter((b) => reached(b, "cim")).length, calls: r.filter((b) => reached(b, "call")).length };
    }),
  };
}
export const csv = (rows: (string | number | undefined)[][]) => rows.map((r) => r.map((c) => { const s = String(c ?? ""); const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; return `"${safe.replace(/"/g, '""')}"`; }).join(",")).join("\n");
