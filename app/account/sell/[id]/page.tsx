import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { SellWizard } from "@/components/account/sell-wizard";
import { Thread } from "@/components/account/thread";
import { Card, PageTitle } from "@/components/desk/panel";
import { findListing } from "@/lib/catalog";
import { me } from "@/lib/my";
import { checks, getSub, subLabels } from "@/lib/seller";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function SellItem({ params }: { params: Promise<{ id: string }> }) {
  const u = await me(); const s = await getSub((await params).id);
  if (!s || s.ownerId !== u.id) notFound();
  const title = s.business.publicTitle || s.business.name || "Untitled draft";
  if (s.status === "draft" || s.status === "changes") {
    const note = s.status === "changes" ? [...s.history].reverse().find((h) => h.status === "changes")?.note : undefined;
    return <><PageTitle title={title} sub={s.status === "changes" ? "Update the details your advisor asked about, then resubmit." : "Your draft saves as you go. Submit when you are ready."} /><SellWizard sub={s} note={note} />{s.messages.length > 0 && <div className="mt-6"><Card title="Messages with your advisor"><Thread messages={s.messages} endpoint={`/api/account/sell/${s.id}`} me="seller" /></Card></div>}</>;
  }
  const l = s.listingSlug ? await findListing(s.listingSlug) : undefined; const live = l && (l.status === "available" || l.status === "offers" || l.status === "pending");
  const flow: [string, boolean][] = [["Submitted", true], ["In review", ["review", "approved"].includes(s.status)], ["Approved", s.status === "approved"], ["Live", !!live]];
  const buyers = l ? (await allBuyers()).filter((b) => b.listingSlug === l.slug && !b.archived) : [];
  const stats: [string, number][] = [["Inquiries", buyers.length], ["NDAs signed", buyers.filter((b) => b.nda).length], ["Funds verified", buyers.filter((b) => b.funds?.status === "verified").length], ["Deal rooms opened", buyers.filter((b) => b.cimViews > 0).length], ["Offers", buyers.reduce((n, b) => n + (b.offers?.length ?? 0), 0)]];
  const verified = checks.filter(([k]) => s.checklist[k]).length;
  return <>
    <PageTitle title={title} sub={`${subLabels[s.status]} · submitted ${s.submittedAt?.slice(0, 10) ?? ""}`}>{live && <Link href={`/buy/${l!.slug}`} target="_blank" className="tbtn"><ExternalLink size={15} />View public listing</Link>}</PageTitle>
    {s.status === "rejected" && <p className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">{[...s.history].reverse().find((h) => h.status === "rejected")?.note ?? "This business is not a fit for our process right now."} You can reply below.</p>}
    <section className="panel mb-3"><div className="well"><ol className="grid grid-cols-4 gap-2">{flow.map(([k, on], n) => <li key={k}><span className={`block h-1.5 rounded-full ${on ? "bg-c-green" : flow[n - 1]?.[1] ? "bg-c-orange" : "bg-muted"}`} /><span className={`mt-2 flex items-center gap-1.5 text-sm ${on ? "font-medium" : "text-muted-foreground"}`}>{on && <Check size={14} className="text-c-green" />}{k}</span></li>)}</ol></div></section>
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        {live && <Card title="Buyer activity" sub="Live, names hidden"><dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">{stats.map(([k, v]) => <div key={k} className="legend" style={{ ["--c" as string]: "var(--c-orange)" }}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="num text-2xl font-semibold">{v}</dd></div>)}</dl></Card>}
        <Card title="Messages with your advisor"><Thread messages={s.messages} endpoint={`/api/account/sell/${s.id}`} me="seller" /></Card>
      </div>
      <div className="space-y-3">
        <Card title="Verification" sub={`${verified} of ${checks.length}`}><ul className="space-y-2.5">{checks.map(([k, label]) => <li key={k} className="flex items-center gap-2.5 text-sm"><span className={`grid size-5 place-items-center rounded-full border ${s.checklist[k] ? "border-c-green bg-c-green text-black" : ""}`}>{s.checklist[k] && <Check size={12} />}</span><span className={s.checklist[k] ? "" : "text-muted-foreground"}>{label}</span></li>)}</ul></Card>
        <Card title="History"><ol className="space-y-2 text-sm">{[...s.history].reverse().map((h, n) => <li key={n} className="flex justify-between gap-3"><span>{subLabels[h.status]}{h.note ? <span className="block text-xs text-muted-foreground">{h.note}</span> : null}</span><span className="num shrink-0 text-xs text-muted-foreground">{h.at.slice(0, 10)}</span></li>)}</ol></Card>
      </div>
    </div></>;
}
