import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, Download, ExternalLink, Gauge, Layers, PieChart, TrendingUp, Users } from "lucide-react";
import { Decide } from "@/components/desk/actions";
import { Area, Columns, Donut, Greeting, Rates, SegBar } from "@/components/desk/viz";
import { stageColors } from "@/components/desk/panel";
import { stageLabels } from "@/lib/types";
import { Card, Empty, PageTitle } from "@/components/desk/panel";
import { money } from "@/content/listings";
import { catalog } from "@/lib/catalog";
import { isAdmin } from "@/lib/admin";
import { ago, analyze, hoursSince } from "@/lib/analytics";
import { allBuyers, allSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";
/** 14-day trend line under a stat. */
function Spark({ data }: { data: number[] }) {
  const max = Math.max(1, ...data); const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${22 - (v / max) * 20}`).join(" ");
  return <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden className="mt-3 h-6 w-full overflow-visible"><polyline points={`0,24 ${pts} 100,24`} className="fill-brand/15" /><polyline points={pts} fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="stroke-brand" /></svg>;
}
function Kpi({ label, value, note, hot, trend }: { label: string; value: string | number; note?: string; hot?: boolean; trend?: number[] }) {
  return <div className="panel"><div className="well !p-4"><p className="text-[13px] text-muted-foreground">{label}</p><p className={`num mt-1.5 text-[32px] font-semibold leading-none ${hot ? "text-c-orange" : ""}`}>{value}</p>{note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}{trend && <Spark data={trend} />}</div></div>;
}
const time = (h: number | null) => (h === null ? "No data" : h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${h.toFixed(1)} hrs` : `${(h / 24).toFixed(1)} days`);
export default async function Overview() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, subs, cat] = await Promise.all([allBuyers(), allSubmissions(), catalog()]);
  const a = analyze(all, subs, cat); const k = a.kpis;
  const events = a.buyers.flatMap((b) => b.events.filter((e) => !["crm_error", "mail_error"].includes(e.type)).map((e) => ({ ...e, id: b.id, name: b.name }))).sort((x, y) => y.at.localeCompare(x.at)).slice(0, 8);
  const today = new Date().toISOString().slice(0, 10);
  const due = a.buyers.flatMap((b) => (b.tasks ?? []).filter((t) => !t.done && t.due && t.due <= today).map((t) => ({ ...t, buyerId: b.id, name: b.name }))).slice(0, 6);
  const live = a.buyers.flatMap((b) => b.offers ?? []).filter((o) => ["Submitted", "Countered", "Accepted"].includes(o.status));
  const open = a.buyers.flatMap((b) => (b.questions ?? []).filter((q) => !q.a).map((q) => ({ ...q, buyerId: b.id, name: b.name }))).slice(0, 5);
  const days = Array.from({ length: 14 }, (_, i) => new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10));
  const daily = (dates: (string | undefined)[]) => days.map((d) => dates.filter((x) => x?.slice(0, 10) === d).length);
  const tBuyers = daily(a.buyers.map((b) => b.createdAt)), tNdas = daily(a.buyers.map((b) => b.nda?.signedAt)), tCims = daily(a.buyers.flatMap((b) => b.events.filter((e) => e.type === "cim").map((e) => e.at))), tCalls = daily(a.buyers.flatMap((b) => b.events.filter((e) => e.type === "call").map((e) => e.at)));
  const d90 = Array.from({ length: 90 }, (_, i) => new Date(Date.now() - (89 - i) * 864e5).toISOString().slice(0, 10));
  const fundsWaiting = a.buyers.filter((b) => b.funds?.status === "submitted").length;
  const issues = all.filter((b) => b.events.some((e) => e.type === "crm_error" || e.type === "mail_error")).length;
  return (<>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 md:mb-6"><Greeting /><div className="flex flex-wrap items-center gap-2"><span className="tbtn"><i className="live-dot" />Live</span><Link href="/admin/pipeline" className="tbtn">Review <span className="count">{k.review}</span></Link><a href="/api/admin/export?type=buyers" className="tbtn"><Download size={15} />Export</a><Link href="/" target="_blank" className="tbtn hidden sm:inline-flex"><ExternalLink size={15} />View site</Link></div></div>
    {issues > 0 && <p role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-destructive/60 p-3 text-sm"><AlertCircle size={17} className="text-destructive" />{issues} {issues === 1 ? "buyer has" : "buyers have"} a failed CRM or email step. Open <Link className="underline" href="/admin/activity">Activity</Link> to see why.</p>}
    <div className="mb-3 grid gap-3 xl:grid-cols-3">
      <Card title="Active buyers" icon={Users}><p className="text-lg font-semibold">{k.total} {k.total === 1 ? "buyer" : "buyers"}</p><p className="mb-5 text-muted-foreground"><span className="text-c-green">+{k.newWeek}</span> new this week across {a.byListing.filter((r) => r.inquiries).length} listings</p><SegBar items={(["inquiry", "nda", "capacity", "review", "cim", "call", "warm"] as const).map((st) => ({ label: stageLabels[st], value: a.buyers.filter((b) => b.stage === st).length, color: stageColors[st] })).filter((x) => x.value > 0).concat(a.buyers.length ? [] : [{ label: "No buyers yet", value: 0, color: "var(--c-gray)" }])} /></Card>
      <Card title="Buyer routes" icon={PieChart}>{a.routes.length ? <Donut center={String(a.routes.reduce((t, r) => t + r.value, 0))} sub="with a route" items={a.routes.map((r) => ({ label: r.label, value: r.value }))} /> : <Empty title="No routes yet" text="Routes appear once buyers complete their profile." />}</Card>
      <Card title="Sources" icon={TrendingUp}>{a.sources.length ? <Rates rows={a.sources.map((r, i) => ({ label: r.label, value: r.value, color: ["var(--c-orange)", "var(--c-blue)", "var(--c-green)", "var(--c-purple)", "var(--c-gray)"][i % 5], note: `${a.buyers.length ? Math.round((r.value / a.buyers.length) * 100) : 0}%` }))} /> : <Empty title="No buyers yet" text="Sources appear with your first inquiry." />}</Card>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <Kpi label="Waiting for review" value={k.review} hot={k.review > 0} note={k.oldestReview ? `Oldest ${ago(k.oldestReview)}` : "Queue is clear"} />
      <Kpi trend={tBuyers} label="Total buyers" value={k.total} note={`${k.newWeek} new in 7 days`} />
      <Kpi trend={tNdas} label="NDAs signed" value={k.ndas} note={`${k.ndaRate}% of buyers`} />
      <Kpi trend={tCims} label="CIMs released" value={k.cims} note={`Median ${time(k.medianToCim)}`} />
      <Kpi trend={tCalls} label="Calls requested" value={k.calls} note="Includes strategy sessions" />
      <Kpi label="Funds to verify" value={fundsWaiting} hot={fundsWaiting > 0} note="Proof of funds queue" />
    </div>
    <div className="mt-3 grid gap-3 xl:grid-cols-2">
      <Card title="Needs your decision" sub="Oldest first" action={<Link href="/admin/pipeline" className="tbtn !h-8 !px-2.5 !text-[13px]">Pipeline</Link>}>
        {a.review.length ? <ul className="-my-2">{a.review.slice(0, 6).map((b) => <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"><div className="min-w-0"><Link href={`/admin/buyers/${b.id}`} className="font-semibold hover:text-brand">{b.name}</Link><p className="truncate text-sm text-muted-foreground">{cat.find((l) => l.slug === b.listingSlug)?.title} · <span className={hoursSince(b.updatedAt) > 24 ? "text-brand" : ""}>{ago(b.updatedAt)} waiting</span></p></div><Decide id={b.id} stage={b.stage} compact /></li>)}</ul> : <Empty title="Nothing to review" text="Buyers who need a decision will appear here." />}
      </Card>
      <Card title="Buyer funnel" sub="Share of all buyers" icon={Gauge}><Rates base={Math.max(1, a.funnel[0]?.value ?? 1)} rows={a.funnel.map((f, i) => ({ label: f.label, value: f.value, color: ["var(--c-gray)", "var(--c-purple)", "var(--c-blue)", "var(--c-orange)", "var(--c-green)", "var(--c-green)"][i], note: `${f.value} · ${a.funnel[0]?.value ? Math.round((f.value / a.funnel[0].value) * 100) : 0}%` }))} /></Card>
      <Card title="Inquiries and NDAs" icon={TrendingUp}><Columns aLabel="Inquiries" bLabel="NDAs signed" days={d90.map((d) => ({ d, a: a.buyers.filter((b) => b.createdAt.slice(0, 10) === d).length, b: a.buyers.filter((b) => b.nda?.signedAt.slice(0, 10) === d).length }))} /></Card>
      <Card title="Buyers by listing" sub="Cumulative" icon={Layers}><Area dates={d90} series={[{ name: "All listings", points: d90.map((d) => a.buyers.filter((b) => b.createdAt.slice(0, 10) <= d).length) }, ...[...a.byListing].filter((r) => r.inquiries).sort((x, y) => y.inquiries - x.inquiries).slice(0, 5).map((r) => ({ name: r.listing.title, points: d90.map((d) => a.buyers.filter((b) => b.listingSlug === r.listing.slug && b.createdAt.slice(0, 10) <= d).length) }))]} /></Card>
      <Card flush title="Listing performance" action={<Link href="/admin/listings" className="tbtn !h-8">Manage</Link>}><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead className="bg-surface-1 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2.5 font-medium">Listing</th>{["Inquiries", "NDAs", "CIMs", "Calls"].map((h) => <th key={h} className="px-4 py-2.5 text-right font-medium">{h}</th>)}</tr></thead><tbody>{[...a.byListing].sort((x, y) => y.inquiries - x.inquiries).slice(0, 6).map((r) => <tr key={r.listing.slug} className="border-t"><td className="max-w-56 truncate px-4 py-3">{r.listing.title}</td>{[r.inquiries, r.ndas, r.cims, r.calls].map((v, i) => <td key={i} className="num px-4 py-3 text-right">{v}</td>)}</tr>)}</tbody></table></div></Card>
      <Card title="Tasks due" action={<Link href="/admin/tasks" className="tbtn !h-8 !px-2.5 !text-[13px]">All</Link>}>{due.length ? <ul className="space-y-2 text-sm">{due.map((t) => <li key={t.id} className="flex justify-between gap-3"><Link href={`/admin/buyers/${t.buyerId}`} className="min-w-0 truncate hover:text-brand">{t.text} · {t.name}</Link><span className="num shrink-0 text-xs text-muted-foreground">{t.due}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Nothing is due.</p>}</Card>
      <Card title="Buyer questions" sub="Waiting for an answer">{open.length ? <ul className="space-y-2.5 text-sm">{open.map((q) => <li key={q.id}><Link href={`/admin/buyers/${q.buyerId}`} className="block hover:text-brand"><span className="line-clamp-2">{q.q}</span><span className="text-xs text-muted-foreground">{q.name}</span></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">All questions answered.</p>}</Card>
      <Card title="Offers on the table" action={<Link href="/admin/offers" className="tbtn !h-8 !px-2.5 !text-[13px]">All</Link>}><p className="num text-[32px] font-medium leading-none">{live.length}</p><p className="mt-2 text-sm text-muted-foreground">{live.length ? `Highest ${money(Math.max(...live.map((o) => o.amountUsd)))}` : "No live offers."}</p></Card>
      <Card title="Recent activity" action={<Link href="/admin/activity" className="tbtn !h-8 !px-2.5 !text-[13px]">All</Link>}>{events.length ? <ol className="space-y-2.5 text-sm">{events.map((e, i) => <li key={i} className="grid grid-cols-[38px_1fr] gap-2"><span className="num text-xs leading-5 text-muted-foreground">{ago(e.at)}</span><span className="min-w-0"><Link href={`/admin/buyers/${e.id}`} className="font-medium hover:text-brand">{e.name}</Link> <span className="text-muted-foreground">{e.detail}</span></span></li>)}</ol> : <p className="text-sm text-muted-foreground">Activity appears after your first inquiry.</p>}</Card>
    </div>
  </>);
}
