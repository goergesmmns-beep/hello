import { getRecord, putRecord } from "./store";
type Views = { total: number; days: Record<string, number> };
const day = (d = new Date()) => d.toISOString().slice(0, 10);
/** Counts a listing page view. Kept per day so sellers see a 30-day trend. */
export async function recordView(slug: string) {
  const v = (await getRecord<Views>("views", slug)) ?? { total: 0, days: {} };
  v.total++; v.days[day()] = (v.days[day()] ?? 0) + 1;
  const cut = day(new Date(Date.now() - 90 * 864e5)); for (const k of Object.keys(v.days)) if (k < cut) delete v.days[k];
  await putRecord("views", slug, v);
}
/** Total views plus the last 30 days, oldest first. */
export async function viewsFor(slug: string) {
  const v = (await getRecord<Views>("views", slug)) ?? { total: 0, days: {} };
  const series = Array.from({ length: 30 }, (_, i) => { const d = day(new Date(Date.now() - (29 - i) * 864e5)); return { d, n: v.days[d] ?? 0 }; });
  return { total: v.total, last30: series.reduce((s, x) => s + x.n, 0), last7: series.slice(-7).reduce((s, x) => s + x.n, 0), series };
}
