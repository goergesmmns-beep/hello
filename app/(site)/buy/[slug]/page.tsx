import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { getListing, listings, money, statusLabel } from "@/content/listings";

type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => listings.map((l) => ({ slug: l.slug }));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const l = getListing((await params).slug);
  return l ? { title: l.title, description: l.summary } : {};
}
export default async function ListingPage({ params }: P) {
  const l = getListing((await params).slug);
  if (!l) notFound();
  const pending = l.status === "pending";
  return (
    <>
      <section className="dark bg-background text-foreground"><div className="wrap py-14 md:py-20">
        <div className="mb-5 flex flex-wrap gap-2"><span className="pill">{l.category}</span><span className={`pill ${l.status === "available" ? "" : "pill-brand"}`}>{statusLabel[l.status]}</span></div>
        <h1 className="rise max-w-4xl text-[clamp(2.1rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-.04em]">{l.headline}</h1>
        <dl className="mt-10 grid grid-cols-2 gap-6 border-t pt-6 md:grid-cols-4"><div><dt className="text-sm text-muted-foreground">Asking price</dt><dd className="num mt-1 text-2xl font-medium">{l.askLabel}</dd></div>{l.metrics.map((m) => <div key={m.label}><dt className="text-sm text-muted-foreground">{m.label}</dt><dd className="num mt-1 text-2xl font-medium">{m.value}</dd></div>)}</dl>
      </div></section>
      <section className="wrap grid gap-12 py-14 md:grid-cols-[minmax(0,1fr)_360px] md:py-20">
        <div className="prose-w min-w-0 space-y-8">
          <p className="text-xl leading-snug tracking-tight">{l.summary}</p>
          {l.body.map((b, i) => <div key={i}>{b.heading && <h2 className="mb-2 text-2xl font-semibold">{b.heading}</h2>}<p className="text-muted-foreground">{b.text}</p></div>)}
          <div><h2 className="mb-3 text-2xl font-semibold">Highlights</h2><ul className="space-y-2.5">{l.highlights.map((h) => <li key={h} className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-brand-ink" />{h}</li>)}</ul></div>
        </div>
        <aside className="h-fit rounded-lg border p-6 md:sticky md:top-24">
          <Lock size={20} className="text-brand-ink" />
          <h2 className="mt-3 text-2xl font-semibold">{pending ? "Sale pending" : "Get the full CIM"}</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">{pending ? "This business is under contract. Ask an advisor about similar opportunities." : "Sign the NDA on your phone and tell us how you plan to buy. It takes a few minutes."}</p>
          {l.idealBuyer === "strategic" && !pending && <p className="mt-3 text-sm">Best suited to a strategic acquirer.</p>}
          {!pending && l.floorUsd && <p className="mt-3 text-sm text-muted-foreground">Typical funds to show: <span className="num text-foreground">{money(l.floorUsd)}</span>. Financing plans are welcome.</p>}
          <Link href={pending ? "/contact" : `/buy/${l.slug}/request`} className="btn btn-primary mt-5 w-full">{pending ? "Talk to an advisor" : "Sign NDA to learn more"}</Link>
        </aside>
      </section>
    </>
  );
}
