import Link from "next/link";
import { ArrowUpRight, Building2, Cpu, GraduationCap, Lock, Megaphone, Newspaper, Package, Repeat, ShoppingBag, type LucideIcon } from "lucide-react";
import { compact, multiples, statusLabel, type Listing } from "@/content/listings";

const icons: Record<string, LucideIcon> = { Agency: Megaphone, eLearning: GraduationCap, Publishing: Newspaper, SaaS: Cpu, "Consumer brand": ShoppingBag, DTC: Package, Subscription: Repeat };
export const categoryIcon = (c: string) => icons[c] ?? Building2;
export const multipleLabel = (l: Listing) => { const m = multiples(l); return m.earnings ? `${m.earnings.toFixed(1)}x earnings` : m.revenue ? `${m.revenue.toFixed(2)}x revenue` : null; };

/** Marketplace card: the facts a buyer screens on, in the order they screen them. */
export function ListingCard({ l }: { l: Listing }) {
  const I = categoryIcon(l.category); const mult = multipleLabel(l);
  const figures = l.metrics.filter((m) => !/^asking/i.test(m.label)).slice(0, 2);
  return (
    <Link href={`/buy/${l.slug}`} className="lift group relative flex h-full flex-col rounded-2xl border bg-card p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-foreground text-background transition-colors group-hover:bg-brand group-hover:text-brand-foreground"><I size={20} /></span>
        <span className={`pill ${l.status === "available" ? "" : "pill-brand"}`}>{statusLabel[l.status]}</span>
      </div>
      <p className="eyebrow mt-5">{l.category}</p>
      <h3 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight">{l.title}</h3>
      <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-muted-foreground">{l.summary}</p>
      <dl className="mt-auto grid grid-cols-3 gap-3 border-t pt-4 [margin-top:max(1.25rem,auto)]">
        <div className="min-w-0"><dt className="truncate text-xs text-muted-foreground">Asking</dt><dd className="num mt-0.5 truncate text-[17px] font-medium">{l.askUsd ? compact(l.askUsd) : "Offers"}</dd></div>
        {figures.map((m) => <div key={m.label} className="min-w-0"><dt className="truncate text-xs text-muted-foreground" title={m.label}>{m.label}</dt><dd className="num mt-0.5 truncate text-[17px] font-medium">{m.value}</dd></div>)}
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
        {mult && <span className="num rounded-md bg-muted px-2 py-1 font-medium">{mult}</span>}
        {l.idealBuyer === "strategic" && <span className="rounded-md bg-muted px-2 py-1 font-medium">Strategic fit</span>}
        <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground"><Lock size={11} /> CIM after NDA</span>
        <ArrowUpRight size={20} className="ml-auto text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-ink" />
      </div>
    </Link>
  );
}
