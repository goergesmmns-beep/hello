import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Card, Empty, PageTitle } from "@/components/desk/shell";
import { analyze, routeLabels } from "@/lib/analytics";
import { catalog } from "@/lib/catalog";
import { allBuyers, allSubmissions } from "@/lib/store";
import type { Buyer } from "@/lib/types";
export const dynamic = "force-dynamic";
const at = (b: Buyer, t: string) => { const e = [...b.events].reverse().find((x) => x.type === t); return e ? new Date(e.at).getTime() : null; };
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const span = (h: number | null) => (h === null ? "No data" : h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${h.toFixed(1)} hrs` : `${(h / 24).toFixed(1)} days`);
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "0%");
const Table = ({ head, rows }: { head: string[]; rows: (string | number)[][] }) => <><ul className="divide-y md:hidden">{rows.map((r, i) => <li key={i} className="py-3"><b className="font-semibold">{r[0]}</b><dl className="mt-1.5 grid grid-cols-3 gap-2">{r.slice(1).map((c, j) => <div key={j}><dt className="text-[11px] text-muted-foreground">{head[j + 1]}</dt><dd className="num text-sm">{c}</dd></div>)}</dl></li>)}</ul><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[480px] text-sm"><thead className="text-left text-[13px] text-muted-foreground"><tr>{head.map((h) => <th key={h} className="pb-2 pr-3 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className={`py-2 pr-3 ${j ? "num" : ""}`}>{c}</td>)}</tr>)}</tbody></table></div></>;
export default async function ReportsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, subs, cat] = await Promise.all([allBuyers(), allSubmissions(), catalog()]);
  const a = analyze(all, subs, cat); const buyers = a.buyers;
  const conv = (key: (b: Buyer) => string | undefined) => [...new Set(buyers.map(key).filter(Boolean))].map((k) => { const r = buyers.filter((b) => key(b) === k); const c = r.filter((b) => b.events.some((e) => e.type === "cim")).length; return [k as string, r.length, pct(r.filter((b) => b.nda).length, r.length), pct(c, r.length), r.filter((b) => b.events.some((e) => e.type === "call")).length, r.reduce((s, b) => s + (b.offers?.length ?? 0), 0)]; });
  const hours = (from: (b: Buyer) => number | null, to: (b: Buyer) => number | null) => median(buyers.flatMap((b) => { const f = from(b), t = to(b); return f && t && t >= f ? [(t - f) / 36e5] : []; }));
  const created = (b: Buyer) => new Date(b.createdAt).getTime(), signed = (b: Buyer) => (b.nda ? new Date(b.nda.signedAt).getTime() : null), cim = (b: Buyer) => at(b, "cim"), funded = (b: Buyer) => (b.funds?.submittedAt ? new Date(b.funds.submittedAt).getTime() : null), checked = (b: Buyer) => (b.funds?.verifiedAt ? new Date(b.funds.verifiedAt).getTime() : null), view = (b: Buyer) => at(b, "cim_view");
  const timing: [string, number | null][] = [["Inquiry to signed NDA", hours(created, signed)], ["NDA to proof of funds", hours(signed, funded)], ["Proof of funds to verified", hours(funded, checked)], ["NDA to CIM released", hours(signed, cim)], ["CIM released to opened", hours(cim, view)]];
  const verified = buyers.filter((b) => b.funds?.status === "verified");
  return (<><PageTitle title="Reports" sub="Where serious buyers come from and how fast they move."><a href="/api/admin/export?type=buyers" className="btn btn-ghost !min-h-10">Export buyers</a></PageTitle>
    {buyers.length ? <div className="grid gap-3 xl:grid-cols-2">
      <Card title="Buyer speed" sub="Median time between steps">{<ul>{timing.map(([k, v]) => <li key={k} className="flex justify-between border-b py-2.5 text-sm last:border-0"><span>{k}</span><span className="num font-medium">{span(v)}</span></li>)}</ul>}</Card>
      <Card title="Verified capital" sub="Across active buyers"><p className="num text-[32px] font-medium leading-none">{verified.length}</p><p className="mt-2 text-sm text-muted-foreground">Buyers verified, with ${verified.reduce((s, b) => s + (b.funds?.verifiedUsd ?? 0), 0).toLocaleString("en-US")} shown in total.</p></Card>
      <Card title="Source quality" className="xl:col-span-2"><Table head={["Source", "Buyers", "NDA rate", "CIM rate", "Calls", "Offers"]} rows={conv((b) => b.source)} /></Card>
      <Card title="Buyer route quality" className="xl:col-span-2"><Table head={["Route", "Buyers", "NDA rate", "CIM rate", "Calls", "Offers"]} rows={conv((b) => (b.route ? routeLabels[b.route] : undefined))} /></Card>
    </div> : <Empty title="No data yet" text="Reports fill in after your first inquiries." />}</>);
}
