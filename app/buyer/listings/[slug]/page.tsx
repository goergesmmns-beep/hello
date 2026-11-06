import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Landmark, Lock, MessagesSquare, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/desk/panel";
import { categoryIcon, multipleLabel } from "@/components/listing-card";
import { ListingTile } from "@/components/portal/listing-tile";
import { RequestButton } from "@/components/portal/request-button";
import { buyerStage } from "@/components/portal/deal-stage";
import { SaveListing } from "@/components/save-listing";
import { ViewBeacon } from "@/components/view-beacon";
import { statusLabel } from "@/content/listings";
import { findListing, isOpen, publicListings } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P) { const l = await findListing((await params).slug); return { title: l?.title ?? "Listing" }; }
export default async function BuyerListing({ params }: P) {
  const { slug } = await params; const u = await me(`/buyer/listings/${slug}`);
  const l = await findListing(slug); if (!l || l.status === "draft" || l.status === "sold") notFound();
  const [deals, all] = await Promise.all([myDeals(u), publicListings()]); const deal = deals.find((d) => d.listingSlug === l.slug); const s = deal && buyerStage(deal);
  const I = categoryIcon(l.category); const mult = multipleLabel(l); const open = isOpen(l);
  const similar = all.filter((x) => x.slug !== l.slug && x.status !== "pending" && !(u.hidden ?? []).includes(x.slug)).sort((a, b) => (b.category === l.category ? 1 : 0) - (a.category === l.category ? 1 : 0)).slice(0, 3);
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="mb-4 text-lg font-semibold tracking-tight">{children}</h2>;
  return <>
    <ViewBeacon slug={l.slug} />
    <Link href="/buyer/listings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} />Marketplace</Link>
    <div className="panel"><div className="well grid-lines relative overflow-hidden p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2"><span className="grid size-9 place-items-center rounded-lg bg-c-orange text-black"><I size={18} /></span><span className="rounded-full border bg-surface-1 px-3 py-1 text-sm">{l.category}</span><span className="rounded-full border bg-surface-1 px-3 py-1 text-sm">{statusLabel[l.status]}</span>{s && <span className="rounded-full border border-c-orange/50 bg-c-orange/10 px-3 py-1 text-sm font-medium text-c-orange">{s.label}</span>}<span className="ml-auto"><SaveListing slug={l.slug} /></span></div>
      <h1 className="mt-5 max-w-3xl text-[clamp(1.6rem,3.4vw,2.5rem)] font-semibold leading-[1.08] tracking-tight">{l.headline}</h1>
      <p className="mt-3 max-w-3xl text-[16.5px] leading-relaxed text-muted-foreground">{l.summary}</p>
      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
        <div className="bg-surface-1 p-4"><dt className="text-[13px] text-muted-foreground">Asking price</dt><dd className="num mt-1 text-2xl font-medium">{l.askLabel}</dd>{mult && <dd className="num mt-0.5 text-xs text-c-orange">{mult}</dd>}</div>
        {l.metrics.filter((m) => !/^asking/i.test(m.label)).slice(0, 3).map((m) => <div key={m.label} className="bg-surface-1 p-4"><dt className="text-[13px] text-muted-foreground">{m.label}</dt><dd className="num mt-1 text-2xl font-medium">{m.value}</dd></div>)}
      </dl>
    </div></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {(l.facts ?? []).length > 0 && <Card title="At a glance"><dl className="grid grid-cols-2 gap-x-6 gap-y-4 xl:grid-cols-3">{l.facts!.map((f) => <div key={f.label}><dt className="text-[13px] text-muted-foreground">{f.label}</dt><dd className="mt-0.5 font-medium leading-snug">{f.value}</dd></div>)}</dl></Card>}
        {l.highlights.length > 0 && <Card title="Investment highlights"><ul className="grid gap-3 sm:grid-cols-2">{l.highlights.map((h, i) => <li key={h} className="flex gap-3 rounded-xl border bg-surface-1 p-4"><span className="num text-sm text-c-orange">{String(i + 1).padStart(2, "0")}</span><span className="font-medium leading-snug">{h}</span></li>)}</ul></Card>}
        <Card title="The business"><div className="space-y-5">{l.body.map((b, i) => <div key={i}>{b.heading && <H>{b.heading}</H>}<p className="-mt-2 leading-relaxed text-muted-foreground">{b.text}</p></div>)}</div></Card>
        {(l.growth ?? []).length > 0 && <Card title="Growth opportunities" icon={TrendingUp}><ul className="grid gap-2.5 sm:grid-cols-2">{l.growth!.map((g) => <li key={g} className="flex items-center gap-3 rounded-xl border bg-surface-1 p-3.5"><TrendingUp size={17} className="shrink-0 text-c-orange" /><span className="font-medium">{g}</span></li>)}</ul></Card>}
        <Card title="Deal room" icon={Lock} sub="Unlocks after the NDA"><div className="grid gap-3 sm:grid-cols-2">{["Full financials and P&L", "Confidential information memorandum", "Customer and revenue breakdown", "Reason for sale and transition plan"].map((t) => <p key={t} className="flex items-center gap-2.5 rounded-xl border border-dashed p-3.5 text-sm text-muted-foreground"><Lock size={14} />{t}</p>)}</div></Card>
      </div>
      <aside className="space-y-5 lg:sticky lg:top-[84px] lg:self-start">
        <section className="panel"><div className="well">
          <p className="text-sm text-muted-foreground">Asking price</p><p className="num mt-1 text-3xl font-medium">{l.askLabel}</p>
          {deal ? <><p className="mt-4 flex items-center gap-2 text-sm"><span className="live-dot !size-2" style={{ background: s!.tone }} />{s!.label}</p><Link id="open-deal" href={`/buyer/deals/${deal.id}`} className="btn btn-brand mt-4 w-full">Open your deal <ArrowRight size={17} /></Link></>
            : open ? <><div className="mt-5"><RequestButton slug={l.slug} /></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Your buyer profile is sent with the request. You sign the NDA next, right here in your dashboard.</p></>
            : <><p className="mt-4 text-sm text-muted-foreground">This sale is pending. Save a search to hear about the next one like it.</p><Link href="/buyer/listings" className="btn btn-ghost mt-4 w-full">Back to the marketplace</Link></>}
          <ul className="mt-5 space-y-2 border-t pt-4 text-sm">{["NDA signed on any device", "Private deal room with the CIM", "Financing plans welcome"].map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-c-orange" />{t}</li>)}</ul>
        </div></section>
        <Card title="Who this suits" icon={Users}><p className="text-sm leading-relaxed text-muted-foreground">{l.idealBuyer === "strategic" ? "A company that can fold this into existing operations, distribution or purchasing." : "Individual operators and strategic buyers. SBA, seller notes and earnouts are all welcome."}</p><p className="mt-3 flex items-center gap-2 text-sm"><Landmark size={15} className="text-muted-foreground" />Financing plans welcome</p></Card>
        <Link href="/contact" className="panel block transition-transform hover:-translate-y-0.5"><div className="well flex items-center gap-3 !p-4"><MessagesSquare size={18} className="text-muted-foreground" /><span><b className="block text-sm font-medium">Questions first?</b><span className="text-sm text-muted-foreground">Talk to an advisor before you sign.</span></span></div></Link>
      </aside>
    </div>
    {similar.length > 0 && <section className="mt-10"><h2 className="mb-4 text-xl font-semibold tracking-tight">Similar businesses</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{similar.map((x) => <ListingTile key={x.slug} l={x} saved={u.saved.includes(x.slug)} />)}</div></section>}
  </>;
}
