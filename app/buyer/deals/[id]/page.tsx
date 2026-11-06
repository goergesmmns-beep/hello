import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Clock, Download, FileSignature, FolderOpen, Handshake, ShieldCheck } from "lucide-react";
import { AccessFlow } from "@/components/access-flow";
import { NdaSigner } from "@/components/portal/nda-signer";
import { Card } from "@/components/desk/panel";
import { buyerStage } from "@/components/portal/deal-stage";
import { progress } from "@/components/account/deal-card";
import { nda } from "@/content/nda";
import { money } from "@/content/listings";
import { findListing } from "@/lib/catalog";
import { publicBuyer } from "@/lib/flow";
import { me, myDeals } from "@/lib/my";
import { getFollowups } from "@/lib/reminders";
import { ruleFor } from "@/lib/rules";
import { saveBuyer } from "@/lib/store";
export const metadata = { title: "Deal" };
const steps = ["Request", "NDA", "Funding", "Advisor review", "Deal room", "Call"];
const said: Record<string, string> = { inquiry: "You requested access", nda_view: "You opened the NDA", profile: "Buyer profile added", nda: "You signed the NDA", funds: "Proof of funds sent", funds_more: "Your advisor asked for more proof", funds_ok: "Funds verified", review: "Advisor review", cim: "Deal room opened for you", cim_view: "You opened the deal room", question: "You asked a question", answer: "Your question was answered", call: "Call requested", offer: "Offer recorded" };
const when = (s: string) => new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
export default async function Deal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const u = await me(`/buyer/deals/${id}`);
  const b = (await myDeals(u)).find((d) => d.id === id); if (!b) notFound();
  const l = await findListing(b.listingSlug); if (!l) notFound();
  // The first time the NDA is shown is recorded, and printed on the signing certificate.
  if (b.why && !b.nda && !b.events.some((e) => e.type === "nda_view")) { b.events.unshift({ at: new Date().toISOString(), type: "nda_view", detail: "Opened the NDA" }); await saveBuyer(b); }
  const s = buyerStage(b); const p = progress(b); const room = b.stage === "cim" || b.stage === "call";
  const flow = !room && b.stage !== "review" && b.stage !== "warm"; const signing = !b.nda && flow;
  const f = u.buyer?.funding ?? ""; const guess = b.route ?? (u.buyer?.type === "strategic" ? "company" : /own|investor/i.test(f) ? "own" : /sba|bank|seller/i.test(f) ? "financing" : undefined);
  const [rule, { bookingUrl }] = await Promise.all([ruleFor(l), getFollowups()]);
  const roomHref = `/room/${b.token}?v=${b.verifyCode}`;
  return <>
    <Link href="/buyer/deals" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />My deals</Link>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div className="min-w-0"><p className="flex items-center gap-2 text-sm text-muted-foreground"><span className="live-dot !size-2" style={{ background: s.tone }} />{s.label}</p><h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight md:text-[28px]">{l.title}</h1></div><Link href={`/buyer/listings/${l.slug}`} className="tbtn">View listing</Link></div>
    <section className="panel mb-5"><div className="well"><ol className="grid grid-cols-3 gap-x-2 gap-y-4 md:grid-cols-6">{steps.map((k, i) => <li key={k} aria-current={i === p ? "step" : undefined}><span className={`block h-1.5 rounded-full ${i < p ? "bg-c-green" : i === p ? "bg-c-orange" : "bg-muted"}`} /><span className={`mt-2 flex items-center gap-1.5 text-[13px] ${i <= p ? "font-medium" : "text-muted-foreground"}`}>{i < p && <Check size={13} className="text-c-green" />}{k}</span></li>)}</ol></div></section>
    {signing && <div className="mb-5"><NdaSigner token={b.token} listing={l.title} signer={{ name: b.name, email: b.email }} needProfile={!b.why || !b.route} defaults={{ route: guess, why: b.why ?? u.buyer?.about, linkedin: u.linkedin, website: u.website }} clauses={nda.clauses} version={nda.version} draft={process.env.NDA_APPROVED !== "true"} /></div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {room ? <section className="panel"><div className="well grid-lines relative overflow-hidden p-6 md:p-8"><span className="grid size-11 place-items-center rounded-xl bg-c-green/15 text-c-green"><FolderOpen size={20} /></span><h2 className="mt-4 text-xl font-semibold tracking-tight">Your deal room is open</h2><p className="mt-1.5 max-w-xl text-muted-foreground">Financials, the CIM, documents and Q&amp;A with the advisor. Everything you open is watermarked to you.</p><div className="mt-6 flex flex-wrap gap-2"><a id="open-room" href={roomHref} className="btn btn-brand">Open the deal room <ArrowRight size={17} /></a>{b.nda && <a href={`/api/access/${b.token}/nda`} target="_blank" rel="noreferrer" className="btn btn-ghost"><Download size={16} />Signed NDA</a>}</div></div></section>
          : b.stage === "review" ? <Card title="An advisor is reviewing your profile" icon={Clock}><p className="text-muted-foreground">Your NDA is signed and your funding is in. An advisor checks fit with the seller, usually within one business day. You will get an email the moment your deal room opens.</p></Card>
          : b.stage === "warm" ? <Card title="On hold for now" icon={Clock}><p className="text-muted-foreground">Your advisor has paused this one. If your funding or plans change, reply to their last email or message us.</p></Card> : null}
        {flow && !signing && <section className="panel" id="nda"><div className="panel-head"><FileSignature size={17} className="text-muted-foreground" /><h2 className="flex-1">Funding</h2><span className="text-xs text-muted-foreground">Saved as you go</span></div><div className="well"><div className="mx-auto max-w-xl"><AccessFlow token={b.token} code={b.verifyCode} buyer={publicBuyer(b)} listing={{ title: l.title, askLabel: l.askLabel, floor: rule.floorUsd, idealBuyer: l.idealBuyer, gate: rule.gate }} clauses={nda.clauses} bookingUrl={bookingUrl} ndaDraft={process.env.NDA_APPROVED !== "true"} /></div></div></section>}
        {(b.offers ?? []).length > 0 && <Card title="Your offers" icon={Handshake}><ul className="-my-1 divide-y">{b.offers!.map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2.5"><span><b className="num font-medium">{money(o.amountUsd)}</b><span className="ml-2 text-sm text-muted-foreground">{[o.cashUsd && `${money(o.cashUsd)} cash`, o.sellerNoteUsd && `${money(o.sellerNoteUsd)} note`, o.earnoutUsd && `${money(o.earnoutUsd)} earnout`].filter(Boolean).join(" · ")}</span></span><span className="rounded-full border bg-surface-1 px-2.5 py-0.5 text-xs">{o.status}</span></li>)}</ul></Card>}
      </div>
      <aside className="space-y-5">
        <Card title="Snapshot"><dl className="space-y-2.5 text-sm">{[["Asking", l.askLabel], ...l.metrics.filter((m) => !/^asking/i.test(m.label)).slice(0, 2).map((m) => [m.label, m.value]), ["Category", l.category]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="num text-right font-medium">{v}</dd></div>)}</dl></Card>
        <Card title="Your records" icon={ShieldCheck}><ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><FileSignature size={15} className="text-muted-foreground" />NDA</span>{b.nda ? <span className="flex items-center gap-3"><a href={`/api/access/${b.token}/nda`} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">PDF</a><a href={`/verify/${b.nda.fileId}`} className="text-muted-foreground underline-offset-4 hover:underline">Verify</a></span> : <span className="text-muted-foreground">Not signed</span>}</li>
          <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><BadgeCheck size={15} className="text-muted-foreground" />Proof of funds</span><span className={b.funds?.status === "verified" ? "font-medium text-c-green" : "text-muted-foreground"}>{b.funds?.status === "verified" ? `Verified ${money(b.funds.verifiedUsd ?? 0)}` : b.funds?.status === "submitted" ? "Being checked" : b.funds?.status === "more" ? "More needed" : "Not sent"}</span></li>
        </ul></Card>
        <Card title="Activity"><ol className="space-y-3">{b.events.filter((e) => said[e.type]).slice(0, 8).map((e, i) => <li key={i} className="flex gap-3 text-sm"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-c-orange" /><span className="min-w-0"><span className="block">{said[e.type]}</span><span className="num text-xs text-muted-foreground">{when(e.at)}</span></span></li>)}</ol></Card>
      </aside>
    </div>
  </>;
}
