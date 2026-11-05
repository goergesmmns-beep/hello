import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, FileText } from "lucide-react";
import { Decide, NoteForm } from "@/components/desk/actions";
import { Card, StagePill } from "@/components/desk/shell";
import { getListing, money } from "@/content/listings";
import { isAdmin } from "@/lib/admin";
import { routeLabels } from "@/lib/analytics";
import { config } from "@/lib/pipedrive";
import { ruleFor } from "@/lib/rules";
import { buyerById } from "@/lib/store";
import { stageLabels } from "@/lib/types";

export const dynamic = "force-dynamic";
const when = (i: string) => i.slice(0, 16).replace("T", " ");
export default async function BuyerPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const b = await buyerById((await params).id);
  if (!b) notFound();
  const l = getListing(b.listingSlug)!; const c = b.capacity; const rule = await ruleFor(l); const pd = await config().catch(() => null);
  const did = (t: string) => b.events.some((e) => e.type === t);
  const steps: [string, boolean][] = [["Inquiry", true], ["Profile", !!b.why], ["NDA", !!b.nda], ["Funding", !!c || did("cim")], ["CIM released", did("cim")], ["CIM opened", b.cimViews > 0], ["Call", did("call")]];
  const profile: [string, string | undefined][] = [["Email", b.email], ["Phone", b.phone], ["Company", b.company], ["LinkedIn", b.linkedin], ["Website", b.website], ["Buyer route", b.route && routeLabels[b.route]], ["Source", b.source], ["Inquiry message", b.message]];
  const funding: [string, string | undefined][] = [["Funding plan", c?.plan], ["Role", c?.role], ["Past acquisitions", c?.acquisitions], ["Competitor", c?.competitor], ["Notes", c?.notes], ["Listing proof of funds", rule.floorUsd ? money(rule.floorUsd) : undefined]];
  const Rows = ({ rows }: { rows: [string, string | undefined][] }) => <dl className="-my-2">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid gap-1 border-b py-2 last:border-0 sm:grid-cols-[150px_1fr]"><dt className="text-sm text-muted-foreground">{k}</dt><dd className="min-w-0 break-words text-[15px]">{v}</dd></div>)}</dl>;
  return (<>
    <Link href="/admin/buyers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Buyers</Link>
    <div className="mb-5 mt-3 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">{l.title}</p><h1 className="text-[34px] font-semibold leading-tight">{b.name}</h1><div className="mt-2 flex items-center gap-2"><StagePill stage={b.stage} label={stageLabels[b.stage]} />{b.archived && <span className="text-sm text-muted-foreground">Archived</span>}</div></div><Decide id={b.id} stage={b.stage} archived={b.archived} /></div>
    <ol className="mb-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-7">{steps.map(([s, on]) => <li key={s} className="flex items-center gap-1.5 bg-card px-3 py-2.5 text-[13px]"><span className={`grid size-4 shrink-0 place-items-center rounded-full ${on ? "bg-brand text-brand-foreground" : "border"}`}>{on && <Check size={11} strokeWidth={3} />}</span><span className={on ? "" : "text-muted-foreground"}>{s}</span></li>)}</ol>
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3">
        {b.why && <Card title="Why this business"><p className="leading-relaxed">{b.why}</p></Card>}
        <Card title="Profile"><Rows rows={profile} /></Card>
        <Card title="Funding and fit"><Rows rows={funding} /></Card>
      </div>
      <div className="min-w-0 space-y-3">
        <Card title="Documents"><div className="space-y-2">{b.nda && <a target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border p-2.5 text-sm hover:border-foreground" href={`/api/admin/files/${b.nda.fileId}`}><FileText size={16} className="text-brand" />Signed NDA <span className="num ml-auto text-xs text-muted-foreground">{b.nda.signedAt.slice(0, 10)}</span></a>}{c?.fileId && <a target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border p-2.5 text-sm hover:border-foreground" href={`/api/admin/files/${c.fileId}`}><FileText size={16} className="text-brand" /><span className="truncate">{c.fileName}</span></a>}{!b.nda && !c?.fileId && <p className="text-sm text-muted-foreground">No documents yet.</p>}{b.cimViews > 0 && <p className="text-sm text-muted-foreground">CIM opened <span className="num text-foreground">{b.cimViews}</span> {b.cimViews === 1 ? "time" : "times"}.</p>}</div></Card>
        {b.pipedrive?.dealId && pd && <a target="_blank" rel="noreferrer" href={`https://${pd.domain}.pipedrive.com/deal/${b.pipedrive.dealId}`} className="flex items-center justify-between rounded-xl border bg-card p-4 text-sm font-medium hover:border-foreground">Open deal in Pipedrive <ExternalLink size={15} /></a>}
        <Card title="Advisor notes"><NoteForm id={b.id} />{(b.notes ?? []).length > 0 && <ul className="mt-4 space-y-3">{b.notes!.map((n, i) => <li key={i} className="border-t pt-3 text-sm"><p className="whitespace-pre-wrap">{n.text}</p><p className="num mt-1 text-xs text-muted-foreground">{when(n.at)}</p></li>)}</ul>}</Card>
        <Card title="Timeline"><ol className="space-y-2.5">{b.events.map((e, i) => <li key={i} className="text-sm"><p className={e.type.endsWith("_error") ? "text-destructive" : ""}>{e.detail}</p><p className="num text-xs text-muted-foreground">{when(e.at)} UTC</p></li>)}</ol></Card>
      </div>
    </div>
  </>);
}
