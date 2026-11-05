import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Listing, statusLabel } from "@/content/listings";

export function PageHead({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <section className="dark relative overflow-hidden bg-background text-foreground">
      <div className="aurora" aria-hidden><i /><i /></div>
      <div className="wrap relative py-16 md:py-24"><p className="eyebrow mb-5 !text-brand">{eyebrow}</p><h1 className="rise max-w-5xl text-[clamp(2.5rem,6.6vw,5.5rem)] font-semibold leading-[1] tracking-[-.045em]">{title}</h1>{lede && <p className="lede mt-6">{lede}</p>}{children}</div>
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
