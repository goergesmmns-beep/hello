import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Listing, statusLabel } from "@/content/listings";

/** Inner page header. Grid lines, drifting light, optional breadcrumb and a stat strip. */
export function PageHead({ eyebrow, title, lede, children, stats, crumbs }: { eyebrow: string; title: string; lede?: string; children?: React.ReactNode; stats?: [string, string][]; crumbs?: [string, string][] }) {
  return (
    <section className="dark relative isolate overflow-hidden bg-background text-foreground">
      <div className="aurora" aria-hidden><i /><i /></div>
      <div aria-hidden className="grid-lines absolute inset-0 -z-10" />
      <div className="wrap relative pb-14 pt-12 md:pb-20 md:pt-20">
        {crumbs && <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">{crumbs.map(([h, l], i) => <span key={h} className="flex items-center gap-1.5">{i > 0 && <span aria-hidden>/</span>}<Link href={h} className="hover:text-foreground">{l}</Link></span>)}</nav>}
        <p className="eyebrow mb-5 flex items-center gap-2 !text-brand"><span aria-hidden className="inline-block h-px w-6 bg-brand" />{eyebrow}</p>
        <h1 className="rise max-w-5xl text-[clamp(2.4rem,6.4vw,5.5rem)] font-semibold leading-[1] tracking-[-.045em]">{title}</h1>
        {lede && <p className="lede mt-6">{lede}</p>}{children}
        {stats && <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:mt-14 md:grid-cols-4">{stats.map(([v, l]) => <div key={l} className="bg-background/70 p-4 backdrop-blur md:p-5"><dt className="sr-only">{l}</dt><dd className="num text-2xl font-medium tracking-tight md:text-[32px]">{v}</dd><dd className="mt-1 text-[13px] leading-snug text-muted-foreground">{l}</dd></div>)}</dl>}
      </div>
    </section>
  );
}
export function ListingRow({ l }: { l: Listing }) {
  return (
    <Link href={`/buy/${l.slug}`} className="sweep group grid gap-x-6 gap-y-2 border-b py-6 transition-[padding] duration-300 hover:md:pl-3 md:grid-cols-[minmax(0,1fr)_170px_210px_24px] md:items-center">
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2"><span className="eyebrow">{l.category}</span>{l.status !== "available" && <span className="pill pill-brand">{statusLabel[l.status]}</span>}</div>
        <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{l.title}</h3>
      </div>
      <p className="num text-lg font-medium">{l.askLabel}</p>
      <p className="text-sm text-muted-foreground">{l.metrics[0].label} <span className="num block text-foreground">{l.metrics[0].value}</span></p>
      <ArrowUpRight className="hidden transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-ink md:block" size={22} />
    </Link>
  );
}
export function Cta({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <section className="dark mesh bg-background text-foreground"><div className="wrap flex flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-end"><div><h2 className="h2 max-w-3xl">{title}</h2><p className="lede mt-4">{text}</p></div><Link href={href} className="btn btn-brand shrink-0">{label}</Link></div></section>
  );
}
