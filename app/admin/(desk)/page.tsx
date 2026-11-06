import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Decide } from "@/components/desk/actions";
import { Breakdown, DailyBars, Funnel } from "@/components/desk/charts";
import { Card, Empty, PageTitle } from "@/components/desk/shell";
import { catalog } from "@/lib/catalog";
import { isAdmin } from "@/lib/admin";
import { ago, analyze, hoursSince } from "@/lib/analytics";
import { allBuyers, allSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";
function Kpi({ label, value, note, hot }: { label: string; value: string | number; note?: string; hot?: boolean }) {
  return <div className={`rounded-xl border bg-card p-4 ${hot ? "gborder" : ""}`}><p className="text-[13px] text-muted-foreground">{label}</p><p className={`num mt-1.5 text-[32px] font-medium leading-none ${hot ? "text-brand" : ""}`}>{value}</p>{note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}</div>;
}
const time = (h: number | null) => (h === null ? "No data" : h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${h.toFixed(1)} hrs` : `${(h / 24).toFixed(1)} days`);
export default async function Overview() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, subs, cat] = await Promise.all([allBuyers(), allSubmissions(), catalog()]);
  const a = analyze(all, subs, cat); const k = a.kpis;
  const events = a.buyers.flatMap((b) => b.events.filter((e) => !["crm_error", "mail_error"].includes(e.type)).map((e) => ({ ...e, id: b.id, name: b.name }))).sort((x, y) => y.at.localeCompare(x.at)).slice(0, 8);
  const issues = all.filter((b) => b.events.some((e) => e.type === "crm_error" || e.type === "mail_error")).length;
  return (<>
    <PageTitle title="Overview" sub="Buyer activity across every listing." />
    {issues > 0 && <p role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-destructive/60 p-3 text-sm"><AlertCircle size={17} className="text-destructive" />{issues} {issues === 1 ? "buyer has" : "buyers have"} a failed CRM or email step. Open <Link className="underline" href="/admin/activity">Activity</Link> to see why.</p>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <Kpi label="Waiting for review" value={k.review} hot={k.review > 0} note={k.oldestReview ? `Oldest ${ago(k.oldestReview)}` : "Queue is clear"} />
      <Kpi label="Total buyers" value={k.total} note={`${k.newWeek} new in 7 days`} />
      <Kpi label="NDAs signed" value={k.ndas} note={`${k.ndaRate}% of buyers`} />
      <Kpi label="CIMs released" value={k.cims} note={`Median ${time(k.medianToCim)}`} />
      <Kpi label="Calls requested" value={k.calls} note="Includes strategy sessions" />
      <Kpi label="Keep warm" value={k.warm} note="Need a funding plan" />
    </div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card title="Needs your decision" sub="Oldest first" action={<Link href="/admin/pipeline" className="text-sm text-muted-foreground hover:text-foreground">Pipeline</Link>}>
        {a.review.length ? <ul className="-my-2">{a.review.slice(0, 6).map((b) => <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"><div className="min-w-0"><Link href={`/admin/buyers/${b.id}`} className="font-semibold hover:text-brand">{b.name}</Link><p className="truncate text-sm text-muted-foreground">{cat.find((l) => l.slug === b.listingSlug)?.title} · <span className={hoursSince(b.updatedAt) > 24 ? "text-brand" : ""}>{ago(b.updatedAt)} waiting</span></p></div><Decide id={b.id} stage={b.stage} compact /></li>)}</ul> : <Empty title="Nothing to review" text="Buyers who need a decision will appear here." />}
      </Card>
      <Card title="Buyer funnel" sub="Each step counts buyers who passed the one before"><Funnel steps={a.funnel} /></Card>
      <Card title="Inquiries" sub="Last 30 days"><DailyBars data={a.daily} /></Card>
      <div className="grid gap-3 sm:grid-cols-2"><Card title="Sources">{a.sources.length ? <Breakdown rows={a.sources} /> : <p className="text-sm text-muted-foreground">No buyers yet.</p>}</Card><Card title="Buyer routes">{a.routes.length ? <Breakdown rows={a.routes} /> : <p className="text-sm text-muted-foreground">No routes chosen yet.</p>}</Card></div>
      <Card title="Listing performance" action={<Link href="/admin/listings" className="text-sm text-muted-foreground hover:text-foreground">Manage</Link>}><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-2 font-medium">Listing</th>{["Inquiries", "NDAs", "CIMs", "Calls"].map((h) => <th key={h} className="pb-2 text-right font-medium">{h}</th>)}</tr></thead><tbody>{[...a.byListing].sort((x, y) => y.inquiries - x.inquiries).slice(0, 6).map((r) => <tr key={r.listing.slug} className="border-t"><td className="max-w-56 truncate py-2.5 pr-3">{r.listing.title}</td>{[r.inquiries, r.ndas, r.cims, r.calls].map((v, i) => <td key={i} className="num py-2.5 text-right">{v}</td>)}</tr>)}</tbody></table></div></Card>
      <Card title="Recent activity" action={<Link href="/admin/activity" className="text-sm text-muted-foreground hover:text-foreground">All</Link>}>{events.length ? <ol className="space-y-2.5 text-sm">{events.map((e, i) => <li key={i} className="grid grid-cols-[38px_1fr] gap-2"><span className="num text-xs leading-5 text-muted-foreground">{ago(e.at)}</span><span className="min-w-0"><Link href={`/admin/buyers/${e.id}`} className="font-medium hover:text-brand">{e.name}</Link> <span className="text-muted-foreground">{e.detail}</span></span></li>)}</ol> : <p className="text-sm text-muted-foreground">Activity appears after your first inquiry.</p>}</Card>
    </div>
  </>);
}
