import Link from "next/link";
import { ArrowRight, Check, Eye } from "lucide-react";
import { SellWizard } from "@/components/account/sell-wizard";
import { Card, PageTitle } from "@/components/desk/panel";
import { money } from "@/content/listings";
import { me } from "@/lib/my";
import { subLabels } from "@/lib/seller";
import { sellerCtx, subTitle } from "@/lib/seller-portal";
export const metadata = { title: "Listing" };
export default async function Listing() {
  const u = await me("/seller/listing"); const { cur: s, live, listing } = await sellerCtx(u);
  if (!s) return <><PageTitle title="Your listing" /><div className="panel"><div className="well p-8 text-center"><p className="text-lg font-semibold">No business listed yet</p><a href="/seller/new" className="btn btn-brand mt-5">Start your listing <ArrowRight size={17} /></a></div></div></>;
  if (s.status === "draft" || s.status === "changes") {
    const note = s.status === "changes" ? [...s.history].reverse().find((h) => h.status === "changes")?.note : undefined;
    return <><PageTitle title={subTitle(s)} sub={s.status === "changes" ? "Update what your advisor asked about, then resubmit." : "Your draft saves as you go. Submit when you are ready."} /><SellWizard sub={s} note={note} /></>;
  }
  const b = s.business; const row = (k: string, v?: string) => v ? <div className="grid gap-1 border-t py-3 first:border-0 first:pt-0 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">{k}</dt><dd className="whitespace-pre-line">{v}</dd></div> : null;
  return <>
    <PageTitle title={subTitle(s)} sub={`${live ? "Live" : subLabels[s.status]} · locked while your advisor works on it`}>{live && <Link href={`/buy/${listing!.slug}`} target="_blank" className="tbtn"><Eye size={15} />Public listing</Link>}<Link href="/seller/messages" className="tbtn">Ask for a change</Link></PageTitle>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card title="The business"><dl>{row("Legal name", b.name)}{row("Public title", b.publicTitle)}{row("Category", b.category)}{row("Business model", b.model)}{row("Founded", b.founded)}{row("Location", b.location)}{row("Team", b.team)}{row("Owner hours a week", b.ownerHours)}{row("Description", b.description)}{row("Customers", b.customers)}</dl></Card>
        <Card title="Financials" flush>{s.financials.length ? <table className="w-full text-sm"><thead className="bg-surface-1 text-left text-[13px] text-muted-foreground"><tr>{["Period", "Revenue", "SDE", "Margin"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{s.financials.map((f) => <tr key={f.period} className="border-t"><td className="px-4 py-3 font-medium">{f.period}</td><td className="num px-4 py-3">{money(f.revenue)}</td><td className="num px-4 py-3">{money(f.sde)}</td><td className="num px-4 py-3 text-muted-foreground">{f.revenue ? `${Math.round((f.sde / f.revenue) * 100)}%` : "–"}</td></tr>)}</tbody></table> : <p className="p-4 text-sm text-muted-foreground">No financials.</p>}</Card>
      </div>
      <div className="space-y-5">
        <Card title="The sale"><dl>{row("Asking price", s.sale.asking ? money(s.sale.asking) : "Open to offers")}{row("Reason", s.sale.reason)}{row("Structures", s.sale.structure?.join(", "))}{row("Transition", s.sale.transition)}{row("Timeline", s.sale.timeline)}</dl></Card>
        {s.highlights.length > 0 && <Card title="Highlights"><ul className="space-y-2">{s.highlights.map((h) => <li key={h} className="flex gap-2 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-c-orange" />{h}</li>)}</ul></Card>}
        <Card title="History"><ol className="space-y-2 text-sm">{[...s.history].reverse().map((h, n) => <li key={n} className="flex justify-between gap-3"><span>{subLabels[h.status]}{h.note ? <span className="block text-xs text-muted-foreground">{h.note}</span> : null}</span><span className="num shrink-0 text-xs text-muted-foreground">{h.at.slice(0, 10)}</span></li>)}</ol></Card>
      </div>
    </div></>;
}
