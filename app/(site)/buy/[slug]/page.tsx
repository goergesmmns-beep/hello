import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Check, FileText, Landmark, Lock, MessagesSquare, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import { categoryIcon, ListingCard, multipleLabel } from "@/components/listing-card";
import { CopyLink } from "@/components/share";
import { compact, statusLabel } from "@/content/listings";
import { findListing, isOpen, publicListings } from "@/lib/catalog";

type P = { params: Promise<{ slug: string }> };
export const revalidate = 60;
export const generateStaticParams = async () => (await publicListings()).map((l) => ({ slug: l.slug }));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const l = await findListing((await params).slug);
  return l ? { title: l.title, description: l.summary, openGraph: { title: `${l.title} for sale`, description: l.summary } } : {};
}
const H2 = ({ n, children }: { n: string; children: React.ReactNode }) => <div className="mb-6 flex items-baseline gap-3"><span className="num text-sm text-brand-ink">{n}</span><h2 className="text-[26px] font-semibold tracking-tight md:text-3xl">{children}</h2></div>;

export default async function ListingPage({ params }: P) {
  const l = await findListing((await params).slug);
  if (!l || l.status === "draft") notFound();
  const all = await publicListings();
  const pending = !isOpen(l); const I = categoryIcon(l.category); const mult = multipleLabel(l);
  const similar = all.filter((x) => x.slug !== l.slug && x.status !== "pending").sort((a, b) => (b.category === l.category ? 1 : 0) - (a.category === l.category ? 1 : 0) || Math.abs((a.askUsd ?? 0) - (l.askUsd ?? 0)) - Math.abs((b.askUsd ?? 0) - (l.askUsd ?? 0))).slice(0, 3);
  const cta = pending ? "/contact" : `/buy/${l.slug}/request`;
  let n = 0; const num = () => String(++n).padStart(2, "0");
  const faq: [string, string][] = [
    ["Will the seller know who I am?", "Only after you sign the NDA, and only through your advisor. Your proof of funds documents are seen by Westbound Road advisors, not posted anywhere public."],
    ["Do I need all the cash?", "No. Tell us how you plan to fund it. SBA, seller notes, earnouts and investor capital are all common, and we route you to a plan instead of turning you away."],
    ["How fast can I see the CIM?", l.gate === "after_nda" ? "Right after you sign the NDA. You get a private link by email." : "After an advisor reviews your profile, usually soon after you sign. You get a private link by email."],
    ["Can I contact the business directly?", "No. All contact runs through Westbound Road. That protects the seller's staff and customers, and it protects your position too."],
  ];
  return (
    <>
      <section className="dark relative isolate overflow-hidden bg-background text-foreground">
        <div className="aurora" aria-hidden><i /><i /></div><div aria-hidden className="grid-lines absolute inset-0 -z-10" />
        <div className="wrap relative pb-12 pt-10 md:pb-16 md:pt-16">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-1.5 text-sm text-muted-foreground"><Link href="/buy" className="hover:text-foreground">Businesses for sale</Link><span aria-hidden>/</span><span>{l.category}</span></nav>
          <div className="mb-5 flex flex-wrap items-center gap-2"><span className="grid size-9 place-items-center rounded-lg bg-brand text-brand-foreground"><I size={18} /></span><span className="pill">{l.category}</span><span className={`pill ${l.status === "available" ? "" : "pill-brand"}`}>{statusLabel[l.status]}</span>{l.idealBuyer === "strategic" && <span className="pill">Strategic fit</span>}</div>
          <h1 className="rise max-w-4xl text-[clamp(2rem,4.8vw,4rem)] font-semibold leading-[1.03] tracking-[-.04em]">{l.headline}</h1>
          <p className="lede mt-5 max-w-3xl">{l.summary}</p>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-4">
            <div className="bg-background/70 p-4 backdrop-blur md:p-5"><dt className="text-[13px] text-muted-foreground">Asking price</dt><dd className="num mt-1 text-2xl font-medium md:text-[30px]">{l.askLabel}</dd>{mult && <dd className="num mt-1 text-xs text-brand">{mult}</dd>}</div>
            {l.metrics.slice(0, 3).map((m) => <div key={m.label} className="bg-background/70 p-4 backdrop-blur md:p-5"><dt className="text-[13px] text-muted-foreground">{m.label}</dt><dd className="num mt-1 text-2xl font-medium md:text-[30px]">{m.value}</dd></div>)}
          </dl>
        </div>
      </section>

      <div className="wrap grid gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-16">
          {(l.facts ?? []).length > 0 && <section><H2 n={num()}>At a glance</H2><dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border xl:grid-cols-3">{l.facts!.map((f) => <div key={f.label} className="bg-background p-4 md:p-5"><dt className="text-[13px] text-muted-foreground">{f.label}</dt><dd className="mt-1 font-medium leading-snug">{f.value}</dd></div>)}</dl></section>}
          {l.highlights.length > 0 && <section><H2 n={num()}>Investment highlights</H2><ul className="grid gap-3 sm:grid-cols-2">{l.highlights.map((h, i) => <li key={h} className="lift flex gap-4 rounded-2xl border p-5"><span className="num text-sm text-brand-ink">{String(i + 1).padStart(2, "0")}</span><span className="font-medium leading-snug">{h}</span></li>)}</ul></section>}
          <section><H2 n={num()}>The business</H2><div className="space-y-7">{l.body.map((b, i) => <div key={i} className="grid gap-2 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">{b.heading ? <h3 className="text-lg font-semibold leading-snug">{b.heading}</h3> : <span />}<p className="text-[17px] leading-relaxed text-muted-foreground">{b.text}</p></div>)}</div></section>
          {(l.growth ?? []).length > 0 && <section><H2 n={num()}>Growth opportunities</H2><ul className="grid gap-2.5 sm:grid-cols-2">{l.growth!.map((g) => <li key={g} className="flex items-center gap-3 rounded-xl bg-muted p-4"><TrendingUp size={18} className="shrink-0 text-brand-ink" /><span className="font-medium">{g}</span></li>)}</ul></section>}
          <section><H2 n={num()}>Who this suits</H2><div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border p-6"><Users size={20} className="text-brand-ink" /><h3 className="mt-4 text-lg font-semibold">{l.idealBuyer === "strategic" ? "A strategic acquirer" : "Individual and strategic buyers"}</h3><p className="mt-1.5 text-muted-foreground">{l.idealBuyer === "strategic" ? "A company that can fold this into existing operations, distribution or purchasing will get the most from it." : "Suited to an operator buying their first or next business, or a company adding a line."}</p></div>
            <div className="rounded-2xl border p-6"><Landmark size={20} className="text-brand-ink" /><h3 className="mt-4 text-lg font-semibold">Financing plans welcome</h3><p className="mt-1.5 text-muted-foreground">SBA, seller notes, earnouts or investor capital. Tell us your plan when you request access.</p></div>
          </div></section>
          {!pending && <section><H2 n={num()}>Inside the deal room</H2>
            <div className="relative overflow-hidden rounded-2xl border">
              <div aria-hidden className="pointer-events-none select-none p-6 blur-[6px]"><div className="grid grid-cols-3 gap-3">{["Revenue", "SDE", "Margin"].map((x) => <div key={x} className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{x}</p><p className="num mt-1 text-2xl">$•,•••,•••</p></div>)}</div><div className="mt-4 flex h-32 items-end gap-3">{[40, 55, 48, 70, 82, 95].map((h, i) => <i key={i} className="block flex-1 rounded-t bg-foreground/80" style={{ height: `${h}%` }} />)}</div></div>
              <div className="absolute inset-0 grid place-items-center bg-background/55 p-6 backdrop-blur-[2px]"><div className="max-w-md text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-foreground text-background"><Lock size={18} /></span><p className="mt-3 text-lg font-semibold">Unlocks after the NDA</p><div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">{[[BarChart3, "Financials and multiples"], [FileText, "CIM and documents"], [MessagesSquare, "Q&A with an advisor"], [Sparkles, "Indication of interest"]].map(([Ic, t]) => { const X = Ic as typeof Lock; return <span key={t as string} className="flex items-center gap-2 rounded-lg border bg-background/80 p-2.5"><X size={15} className="shrink-0 text-brand-ink" />{t as string}</span>; })}</div></div></div>
            </div></section>}
          <section><H2 n={num()}>Common questions</H2><div className="divide-y rounded-2xl border">{faq.map(([q, a]) => <details key={q} className="group p-5 [&_summary::-webkit-details-marker]:hidden"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{q}<span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 text-muted-foreground">{a}</p></details>)}</div></section>
        </div>

        <aside className="hidden lg:block"><div className="sticky top-24 space-y-3">
          <div className="gborder rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">Asking price</p><p className="num mt-1 text-3xl font-medium">{l.askLabel}</p>{mult && <p className="num mt-1 text-sm text-muted-foreground">{mult}</p>}
            <Link id="rail-cta" href={cta} className="btn btn-brand mt-6 w-full">{pending ? "Talk to an advisor" : "Sign NDA and unlock"} <ArrowRight size={17} /></Link>
            <ul className="mt-5 space-y-2.5 text-sm">{(pending ? ["This sale is pending", "Ask about similar businesses", "Set a deal alert for the next one"] : ["One-tap NDA on any device", "Private deal room with the CIM", "Financing plans welcome"]).map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand-ink" />{t}</li>)}</ul>
          </div>
          <div className="flex items-center justify-between rounded-2xl border p-4 text-sm"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-ink" />Confidential process</span><CopyLink /></div>
          <Link href="/contact" className="block rounded-2xl border p-4 text-sm hover:border-foreground/40"><span className="font-semibold">Questions first?</span><span className="block text-muted-foreground">Talk to an advisor before you sign.</span></Link>
        </div></aside>
      </div>

      {similar.length > 0 && <section className="border-t bg-muted/40"><div className="wrap py-14 md:py-20"><div className="mb-8 flex items-end justify-between gap-4"><h2 className="text-[26px] font-semibold tracking-tight md:text-3xl">Similar opportunities</h2><Link href="/buy" className="text-sm font-medium underline-offset-4 hover:underline">All listings</Link></div><div className="grid gap-4 md:grid-cols-3">{similar.map((x) => <ListingCard key={x.slug} l={x} />)}</div></div></section>}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}><div className="flex items-center gap-3"><div className="min-w-0"><p className="text-xs text-muted-foreground">Asking</p><p className="num truncate font-medium">{l.askUsd ? compact(l.askUsd) : l.askLabel}</p></div><Link id="bar-cta" href={cta} className="btn btn-brand ml-auto">{pending ? "Talk to an advisor" : "Sign NDA and unlock"}</Link></div></div>
      <div className="h-20 lg:hidden" />
    </>
  );
}
