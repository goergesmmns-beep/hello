"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Bookmark, Eye, EyeOff, Lock } from "lucide-react";
import { categoryIcon, multipleLabel } from "@/components/listing-card";
import { compact, statusLabel, type Listing } from "@/content/listings";

const tone: Record<string, string> = { available: "var(--c-green)", offers: "var(--c-orange)", pending: "var(--c-purple)", sold: "var(--c-gray)" };
export async function post(body: Record<string, unknown>) { const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.ok ? r.json() : null; }

/** A listing inside the buyer portal. Opens the in-dashboard listing page, never the public site. */
export function ListingTile({ l, saved, hidden, deal, view = "grid", onHide }: { l: Listing; saved: boolean; hidden?: boolean; deal?: string; view?: "grid" | "list"; onHide?: (slug: string, on: boolean) => void }) {
  const [on, setOn] = useState(saved); const I = categoryIcon(l.category); const mult = multipleLabel(l);
  const figures = [{ label: "Asking", value: l.askUsd ? compact(l.askUsd) : "Offers" }, ...l.metrics.filter((m) => !/^asking/i.test(m.label)).slice(0, 2)];
  const href = `/buyer/listings/${l.slug}`;
  const actions = <div className="flex items-center gap-1">
    <button type="button" aria-label={on ? "Remove from saved" : "Save listing"} aria-pressed={on} data-save={l.slug} onClick={async () => { setOn(!on); if (!(await post({ action: on ? "unsave" : "save", slug: l.slug }))) setOn(on); }} className={`grid size-8 cursor-pointer place-items-center rounded-lg border bg-surface-1 transition-colors hover:text-foreground ${on ? "text-c-orange" : "text-muted-foreground"}`}><Bookmark size={15} className={on ? "fill-current" : ""} /></button>
    {onHide && <button type="button" aria-label={hidden ? "Show listing again" : "Hide listing"} data-hide={l.slug} onClick={async () => { onHide(l.slug, !hidden); await post({ action: hidden ? "unhide" : "hide", slug: l.slug }); }} className="grid size-8 cursor-pointer place-items-center rounded-lg border bg-surface-1 text-muted-foreground transition-colors hover:text-foreground">{hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>}
  </div>;
  const status = <span className="flex shrink-0 items-center gap-1.5 rounded-full border bg-surface-2 px-2.5 py-0.5 text-xs font-medium" style={{ ["--c" as string]: tone[l.status] }}><i className="live-dot !size-1.5" style={{ background: "var(--c)" }} />{statusLabel[l.status]}</span>;
  const dealTag = deal && <span className="shrink-0 rounded-md border border-c-orange/50 bg-c-orange/10 px-2 py-0.5 text-xs font-medium text-c-orange">{deal}</span>;
  if (view === "list") return <article className={`panel ${hidden ? "opacity-60" : ""}`}><div className="well flex flex-col gap-4 !p-4 md:flex-row md:items-center">
    <span className="grid size-11 shrink-0 place-items-center rounded-xl border bg-surface-1"><I size={19} /></span>
    <Link href={href} className="min-w-0 flex-1 hover:text-c-orange"><span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{l.category}{dealTag}</span><h3 className="mt-0.5 truncate text-[16.5px] font-semibold tracking-tight">{l.title}</h3><p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{l.summary}</p></Link>
    <dl className="grid shrink-0 grid-cols-3 gap-5 md:w-[340px]">{figures.map((m) => <div key={m.label} className="min-w-0"><dt className="truncate text-xs text-muted-foreground">{m.label}</dt><dd className="num truncate text-[15px] font-medium">{m.value}</dd></div>)}</dl>
    <div className="flex shrink-0 items-center gap-2">{status}{actions}</div>
  </div></article>;
  return <article className={`panel group h-full ${hidden ? "opacity-60" : ""}`}>
    <div className="panel-head"><I size={17} className="text-muted-foreground transition-colors group-hover:text-c-orange" /><span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{l.category}</span>{status}</div>
    <div className="well flex flex-col">
      <div className="flex items-start justify-between gap-3"><Link href={href} className="min-w-0 hover:text-c-orange"><h3 className="text-[18px] font-semibold leading-tight tracking-tight">{l.title}</h3></Link>{dealTag}</div>
      <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-muted-foreground">{l.summary}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">{figures.map((m, i) => <div key={m.label} className="legend min-w-0" style={{ ["--c" as string]: ["var(--c-orange)", "var(--c-blue)", "var(--c-green)"][i] }}><dt className="truncate text-xs text-muted-foreground" title={m.label}>{m.label}</dt><dd className="num mt-0.5 truncate text-[15px] font-medium" title={m.value}>{m.value}</dd></div>)}</dl>
      <div className="mt-auto flex items-center gap-1.5 pt-5 text-xs">
        {mult ? <span className="num rounded-md border bg-surface-1 px-2 py-1 font-medium">{mult}</span> : <span className="flex items-center gap-1 rounded-md border bg-surface-1 px-2 py-1 text-muted-foreground"><Lock size={11} />CIM after NDA</span>}
        <span className="ml-auto" />{actions}<Link href={href} aria-label={`Open ${l.title}`} className="grid size-8 place-items-center rounded-lg border bg-surface-1 transition-colors hover:border-c-orange hover:bg-c-orange hover:text-black"><ArrowUpRight size={16} /></Link>
      </div>
    </div>
  </article>;
}
