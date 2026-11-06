import Link from "next/link";
import { ArrowUpRight, Building2, Cpu, GraduationCap, Lock, Megaphone, MoreHorizontal, Newspaper, Package, Repeat, ShoppingBag, type LucideIcon } from "lucide-react";
import { compact, multiples, statusLabel, type Listing } from "@/content/listings";

const icons: Record<string, LucideIcon> = { Agency: Megaphone, eLearning: GraduationCap, Publishing: Newspaper, SaaS: Cpu, "Consumer brand": ShoppingBag, DTC: Package, Subscription: Repeat };
export const categoryIcon = (c: string) => icons[c] ?? Building2;
export const multipleLabel = (l: Listing) => { const m = multiples(l); return m.earnings ? `${m.earnings.toFixed(1)}x earnings` : m.revenue ? `${m.revenue.toFixed(2)}x revenue` : null; };
const tone: Record<string, string> = { available: "var(--c-green)", offers: "var(--c-orange)", pending: "var(--c-purple)", sold: "var(--c-gray)" };

/** Marketplace card: a header strip on the outer shell, details in the inset well. */
export function ListingCard({ l }: { l: Listing }) {
  const I = categoryIcon(l.category); const mult = multipleLabel(l);
  const figures = l.metrics.filter((m) => !/^asking/i.test(m.label)).slice(0, 2);
  return (
    <Link href={`/buy/${l.slug}`} className="panel group h-full transition-transform duration-300 hover:-translate-y-1">
      <div className="panel-head"><I size={17} className="text-muted-foreground transition-colors group-hover:text-c-orange" /><span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{l.category}</span><span className="flex items-center gap-1.5 rounded-full border bg-surface-2 px-2.5 py-0.5 text-xs font-medium" style={{ ["--c" as string]: tone[l.status] }}><i className="live-dot !size-1.5" style={{ background: "var(--c)" }} />{statusLabel[l.status]}</span><MoreHorizontal size={17} className="text-muted-foreground" /></div>
      <div className="well flex flex-col">
        <h3 className="text-[19px] font-semibold leading-tight tracking-tight">{l.title}</h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-muted-foreground">{l.summary}</p>
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
          {[{ label: "Asking", value: l.askUsd ? compact(l.askUsd) : "Offers" }, ...figures].map((m, i) => <div key={m.label} className="legend min-w-0" style={{ ["--c" as string]: ["var(--c-orange)", "var(--c-blue)", "var(--c-green)"][i] }}><dt className="truncate text-xs text-muted-foreground" title={m.label}>{m.label}</dt><dd className="num mt-0.5 truncate text-[15px] font-medium" title={m.value}>{m.value}</dd></div>)}
        </dl>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5 text-xs">
          {mult && <span className="num rounded-md border bg-surface-1 px-2 py-1 font-medium">{mult}</span>}
          {l.idealBuyer === "strategic" && <span className="rounded-md border bg-surface-1 px-2 py-1 font-medium">Strategic fit</span>}
          <span className="flex items-center gap-1 rounded-md border bg-surface-1 px-2 py-1 text-muted-foreground"><Lock size={11} /> CIM after NDA</span>
          <span className="ml-auto grid size-8 place-items-center rounded-full border bg-surface-1 transition-colors group-hover:border-c-orange group-hover:bg-c-orange group-hover:text-black"><ArrowUpRight size={16} /></span>
        </div>
      </div>
    </Link>
  );
}
