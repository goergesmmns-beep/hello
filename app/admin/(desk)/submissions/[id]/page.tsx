import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Thread } from "@/components/account/thread";
import { Card, PageTitle } from "@/components/desk/panel";
import { ReviewActions } from "@/components/desk/review";
import { checks, getSub, subLabels } from "@/lib/seller";
export const dynamic = "force-dynamic";
const usd = (n?: number) => (n || n === 0 ? `$${Math.round(n).toLocaleString("en-US")}` : "–");
export default async function Review({ params }: { params: Promise<{ id: string }> }) {
  const s = await getSub((await params).id); if (!s) notFound(); const b = s.business;
  const rows: [string, string | undefined][] = [["Private name", b.name], ["Website", b.url], ["Category", b.category], ["Model", b.model], ["Founded", b.founded], ["Location", b.location], ["Team", b.team], ["Owner hours a week", b.ownerHours]];
  return <><Link href="/admin/submissions" className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />Submissions</Link>
    <PageTitle title={b.publicTitle || b.name || "Submission"} sub={`${subLabels[s.status]} · ${s.ownerName} · ${s.ownerEmail}`} />
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <Card title="Business"><dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{rows.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v || "–"}</dd></div>)}</dl><p className="mt-5 whitespace-pre-line border-t pt-4 leading-relaxed">{b.description}</p>{b.customers && <p className="mt-3 text-sm text-muted-foreground">Customers: {b.customers}</p>}</Card>
        <Card title="Financials" flush><table className="w-full text-sm"><thead className="bg-surface-1 text-left text-[13px] text-muted-foreground"><tr><th className="px-4 py-2.5 font-medium">Period</th><th className="px-4 py-2.5 text-right font-medium">Revenue</th><th className="px-4 py-2.5 text-right font-medium">SDE</th><th className="px-4 py-2.5 text-right font-medium">Margin</th></tr></thead><tbody>{s.financials.map((f) => <tr key={f.period} className="border-t"><td className="px-4 py-3">{f.period}</td><td className="num px-4 py-3 text-right">{usd(f.revenue)}</td><td className="num px-4 py-3 text-right">{usd(f.sde)}</td><td className="num px-4 py-3 text-right">{f.revenue ? `${Math.round((f.sde / f.revenue) * 100)}%` : ""}</td></tr>)}</tbody></table></Card>
        <div className="grid gap-3 md:grid-cols-2"><Card title="Highlights"><ul className="list-disc space-y-1 pl-5 text-sm">{s.highlights.map((h) => <li key={h}>{h}</li>)}</ul></Card><Card title="Growth"><ul className="list-disc space-y-1 pl-5 text-sm">{s.growth.map((h) => <li key={h}>{h}</li>)}</ul></Card></div>
        <Card title="The sale"><dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{[["Reason", s.sale.reason], ["Transition", s.sale.transition], ["Price in mind", s.sale.asking ? usd(s.sale.asking) : "Open"], ["Timeline", s.sale.timeline], ["Structures", s.sale.structure?.join(", ")], ["Notes", s.sale.notes]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="whitespace-pre-line">{v || "–"}</dd></div>)}</dl></Card>
        <Card title="Messages with the owner"><Thread messages={s.messages} endpoint={`/api/admin/submissions/${s.id}`} me="advisor" /></Card>
      </div>
      <div className="space-y-3 xl:sticky xl:top-20 xl:self-start">
        <Card title="Verification"><ReviewActions id={s.id} status={s.status} slug={s.listingSlug} checks={checks} done={s.checklist} /></Card>
        <Card title="Documents" sub={String(s.docs.length)}>{s.docs.length ? <ul className="space-y-2">{s.docs.map((d) => <li key={d.fileId}><a target="_blank" rel="noreferrer" href={`/api/admin/seller-docs?file=${encodeURIComponent(d.fileId)}`} className="flex items-center gap-2.5 rounded-lg border bg-surface-1 p-2.5 text-sm hover:border-foreground/30"><FileText size={16} className="text-c-orange" /><span className="min-w-0 flex-1 truncate">{d.name}</span><span className="text-xs text-muted-foreground">{d.folder}</span></a></li>)}</ul> : <p className="text-sm text-muted-foreground">No documents.</p>}</Card>
        {s.confirm && <Card title="Owner declaration"><p className="text-sm">Confirmed ownership and accuracy, signed <b>{s.confirm.name}</b> on {s.confirm.at.slice(0, 16).replace("T", " ")} UTC.</p></Card>}
      </div>
    </div></>;
}
