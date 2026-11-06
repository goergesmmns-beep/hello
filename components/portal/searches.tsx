"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, BellOff, Search, Trash2 } from "lucide-react";
import type { SavedSearch } from "@/lib/accounts";
import { post } from "./listing-tile";
const priceName: Record<string, string> = { "0-250000": "Under $250K", "250000-1000000": "$250K to $1M", "1000000-5000000": "$1M to $5M", "5000000-": "$5M and up" };
/** Saved searches with email alerts the buyer can switch off. */
export function Searches({ rows: rows0, counts }: { rows: SavedSearch[]; counts: Record<string, number> }) {
  const [rows, setRows] = useState(rows0);
  if (!rows.length) return <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center"><span className="mb-3 grid size-11 place-items-center rounded-xl border bg-surface-1"><Bell size={18} /></span><p className="text-lg font-semibold">No saved searches yet</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Set filters in the marketplace and tap Save search. We email you when a new business matches.</p><Link href="/buyer/listings" className="btn btn-primary mt-5 !min-h-10">Open the marketplace</Link></div>;
  return <div className="tablebox !m-0 divide-y">{rows.map((s) => { const qs = new URLSearchParams(Object.entries({ q: s.q ?? "", cat: s.cat && s.cat !== "all" ? s.cat : "", price: s.price && s.price !== "any" ? s.price : "", sort: s.sort && s.sort !== "newest" ? s.sort : "" }).filter(([, v]) => v)); const n = counts[s.id] ?? 0;
    return <div key={s.id} data-search={s.name} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
      <div className="min-w-0 flex-1"><p className="font-medium">{s.name}</p><p className="mt-1 flex flex-wrap gap-1.5 text-xs">{[s.cat && s.cat !== "all" ? s.cat : "Any category", priceName[s.price ?? ""] ?? "Any price", s.q ? `"${s.q}"` : ""].filter(Boolean).map((t) => <span key={t} className="rounded-md border bg-surface-1 px-2 py-0.5 text-muted-foreground">{t}</span>)}</p></div>
      <span className="num shrink-0 text-sm text-muted-foreground">{n} {n === 1 ? "match" : "matches"} now</span>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-pressed={s.alerts} data-alerts={s.id} onClick={async () => { const on = !s.alerts; setRows(rows.map((x) => (x.id === s.id ? { ...x, alerts: on } : x))); await post({ action: "search-alerts", id: s.id, on }); }} className={`tbtn !h-9 ${s.alerts ? "!border-c-orange/60 text-c-orange" : ""}`}>{s.alerts ? <><Bell size={15} />Alerts on</> : <><BellOff size={15} />Alerts off</>}</button>
        <Link href={`/buyer/listings${qs.size ? `?${qs}` : ""}`} className="tbtn !h-9"><Search size={15} />Show results</Link>
        <button type="button" aria-label={`Delete ${s.name}`} onClick={async () => { setRows(rows.filter((x) => x.id !== s.id)); await post({ action: "search-delete", id: s.id }); }} className="tbtn !h-9 !px-2.5 text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button>
      </div>
    </div>; })}</div>;
}
