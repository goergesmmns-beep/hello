"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { Listing } from "@/content/listings";
import { ListingTile, post } from "./listing-tile";

const prices = [["any", "Any price"], ["0-250000", "Under $250K"], ["250000-1000000", "$250K to $1M"], ["1000000-5000000", "$1M to $5M"], ["5000000-", "$5M and up"]] as const;
const sorts = [["newest", "Newest"], ["price-desc", "Price, high to low"], ["price-asc", "Price, low to high"], ["revenue", "Revenue, high to low"], ["multiple", "Lowest multiple"]] as const;
type F = { q: string; cat: string; price: string; sort: string; open: boolean; showHidden: boolean };
const blank: F = { q: "", cat: "all", price: "any", sort: "newest", open: false, showHidden: false };
const priceName = (p: string) => prices.find(([k]) => k === p)?.[1] ?? "";

/** The marketplace inside the buyer dashboard: filters, saved searches and hidden listings. */
export function BuyerMarket({ listings, saved, hidden: hidden0, deals }: { listings: Listing[]; saved: string[]; hidden: string[]; deals: Record<string, string> }) {
  const [f, setF] = useState<F>(blank); const [view, setView] = useState<"grid" | "list">("grid"); const [hidden, setHidden] = useState(hidden0); const [filters, setFilters] = useState(false);
  const [saving, setSaving] = useState<"" | "open" | "busy" | "done">(""); const [name, setName] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { const p = new URLSearchParams(location.search); setF({ ...blank, q: p.get("q") ?? "", cat: p.get("cat") ?? "all", price: p.get("price") ?? "any", sort: p.get("sort") ?? "newest", open: p.get("open") === "1" }); try { const v = localStorage.getItem("wb_view"); if (v === "list" || v === "grid") setView(v); } catch {} }, []);
  useEffect(() => { const p = new URLSearchParams(); if (f.q) p.set("q", f.q); if (f.cat !== "all") p.set("cat", f.cat); if (f.price !== "any") p.set("price", f.price); if (f.sort !== "newest") p.set("sort", f.sort); if (f.open) p.set("open", "1"); history.replaceState(null, "", `${location.pathname}${p.size ? `?${p}` : ""}`); setSaving((s) => (s === "done" ? "" : s)); }, [f]);
  const set = (x: Partial<F>) => setF((o) => ({ ...o, ...x }));
  const cats = useMemo(() => [...new Set(listings.map((l) => l.category))].sort().map((c) => [c, listings.filter((l) => l.category === c).length] as const), [listings]);
  const rows = useMemo(() => {
    const [lo, hi] = f.price === "any" ? [0, Infinity] : f.price.split("-").map((x, i) => (x ? Number(x) : i ? Infinity : 0)); const q = f.q.toLowerCase().trim();
    const r = listings.map((l, i) => ({ l, i })).filter(({ l }) => (f.showHidden || !hidden.includes(l.slug)) && (f.cat === "all" || l.category === f.cat) && (!f.open || l.status !== "pending") && (f.price === "any" || (l.askUsd !== null && l.askUsd >= lo && l.askUsd < hi)) && (!q || `${l.title} ${l.headline} ${l.summary} ${l.category}`.toLowerCase().includes(q)));
    const mult = (l: Listing) => (l.askUsd && l.earningsUsd ? l.askUsd / l.earningsUsd : Infinity);
    r.sort((a, b) => f.sort === "price-desc" ? (b.l.askUsd ?? -1) - (a.l.askUsd ?? -1) : f.sort === "price-asc" ? (a.l.askUsd ?? Infinity) - (b.l.askUsd ?? Infinity) : f.sort === "revenue" ? (b.l.revenueUsd ?? -1) - (a.l.revenueUsd ?? -1) : f.sort === "multiple" ? mult(a.l) - mult(b.l) : a.i - b.i);
    return r.map((x) => x.l);
  }, [listings, f, hidden]);
  const active = (f.q ? 1 : 0) + (f.cat !== "all" ? 1 : 0) + (f.price !== "any" ? 1 : 0) + (f.open ? 1 : 0);
  const suggest = [f.cat !== "all" ? f.cat : "", f.price !== "any" ? priceName(f.price) : "", f.q ? `"${f.q}"` : ""].filter(Boolean).join(" · ") || "All new listings";
  const saveSearch = async () => { setSaving("busy"); setErr(""); const d = await post({ action: "search-save", data: { name: name.trim() || suggest, q: f.q || undefined, cat: f.cat, price: f.price, sort: f.sort, alerts: true } }); if (!d) { setErr("That did not save. You can keep up to 20 searches."); setSaving("open"); return; } setSaving("done"); };
  const sel = "input !min-h-9 !w-auto !rounded-[10px] !py-1 !pr-8 !text-[13.5px]";
  const panel = <div className="space-y-6">
    <div><p className="mb-2 text-[13px] font-medium text-muted-foreground">Category</p><div className="grid gap-0.5" role="group" aria-label="Category">{[["all", listings.length] as const, ...cats].map(([c, n]) => <button key={c} type="button" aria-pressed={f.cat === c} onClick={() => set({ cat: c })} className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${f.cat === c ? "bg-surface-2 font-medium shadow-[inset_0_0_0_1px_var(--line-2)]" : "text-muted-foreground hover:bg-surface-1 hover:text-foreground"}`}>{c === "all" ? "All categories" : c}<span className="num text-xs opacity-70">{n}</span></button>)}</div></div>
    <div><p className="mb-2 text-[13px] font-medium text-muted-foreground">Asking price</p><div className="grid gap-0.5" role="radiogroup" aria-label="Asking price">{prices.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={f.price === k} onClick={() => set({ price: k })} className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm ${f.price === k ? "font-medium" : "text-muted-foreground hover:text-foreground"}`}><span className={`grid size-4 place-items-center rounded-full border ${f.price === k ? "border-c-orange" : ""}`}>{f.price === k && <i className="block size-2 rounded-full bg-c-orange" />}</span>{l}</button>)}</div></div>
    <div className="space-y-2.5 border-t pt-5 text-sm"><label className="flex cursor-pointer items-center gap-2.5" htmlFor="m-open"><input id="m-open" type="checkbox" checked={f.open} onChange={(e) => set({ open: e.target.checked })} className="size-4 accent-[var(--c-orange)]" />Hide sale pending</label><label className="flex cursor-pointer items-center gap-2.5" htmlFor="m-hidden"><input id="m-hidden" type="checkbox" checked={f.showHidden} onChange={(e) => set({ showHidden: e.target.checked })} className="size-4 accent-[var(--c-orange)]" />Show hidden ({hidden.length})</label></div>
  </div>;
  return <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
    <aside className="hidden lg:block"><div className="sticky top-[84px]">{panel}</div></aside>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1"><span className="sr-only">Search listings</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="market-search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search by keyword, model or sector" className="input !min-h-10 !rounded-[10px] !py-1.5 !pl-9 !text-[15px]" /></label>
        <button type="button" onClick={() => setFilters(!filters)} aria-expanded={filters} className="tbtn !h-10 lg:hidden"><SlidersHorizontal size={15} />Filters{active > 0 && <span className="num grid size-5 place-items-center rounded-full bg-c-orange text-[11px] text-black">{active}</span>}</button>
        <label className="sr-only" htmlFor="market-sort">Sort</label><select id="market-sort" className={`${sel} !min-h-10`} value={f.sort} onChange={(e) => set({ sort: e.target.value })}>{sorts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <div className="seg !h-10" role="group" aria-label="Layout">{([["grid", LayoutGrid], ["list", List]] as const).map(([k, I]) => <button key={k} type="button" aria-label={`${k} view`} aria-pressed={view === k} onClick={() => { setView(k); try { localStorage.setItem("wb_view", k); } catch {} }} className="tbtn !h-8 !border-0 !px-2.5 aria-pressed:!bg-surface-2"><I size={15} /></button>)}</div>
        <button id="save-search" type="button" onClick={() => { setName(""); setSaving(saving === "open" ? "" : "open"); }} className="btn btn-brand !min-h-10 !rounded-[10px] !px-3.5 !text-[13.5px]">{saving === "done" ? <><Check size={15} />Saved</> : <><Bell size={15} />Save search</>}</button>
      </div>
      {filters && <div className="panel mt-3 lg:hidden"><div className="well">{panel}</div></div>}
      {(saving === "open" || saving === "busy") && <div className="panel mt-3"><div className="well flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="field flex-1" htmlFor="ss-name">Name this search<input id="ss-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={suggest} maxLength={100} className="input" /></label>
        <p className="text-sm text-muted-foreground sm:max-w-[260px]">We email you when a new listing matches. You can turn alerts off any time.</p>
        <button id="ss-save" disabled={saving === "busy"} onClick={saveSearch} className="btn btn-primary !min-h-11">{saving === "busy" ? "Saving…" : "Save and alert me"}</button>
      </div>{err && <p role="alert" className="px-5 pb-3 text-sm text-destructive">{err}</p>}</div>}
      {saving === "done" && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Check size={15} className="text-c-green" /><span>Saved. Manage it in <Link href="/buyer/searches" className="font-medium underline-offset-4 hover:underline">Saved searches</Link>.</span></p>}
      <div className="mb-4 mt-5 flex items-center justify-between text-sm text-muted-foreground"><p aria-live="polite"><span className="num text-foreground">{rows.length}</span> {rows.length === 1 ? "business" : "businesses"}{f.cat !== "all" && <> in <span className="text-foreground">{f.cat}</span></>}</p>{active > 0 && <button type="button" onClick={() => setF({ ...blank, sort: f.sort })} className="flex cursor-pointer items-center gap-1 hover:text-foreground"><X size={14} />Clear filters</button>}</div>
      {rows.length ? <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 2xl:grid-cols-3" : "grid gap-3"}>{rows.map((l) => <ListingTile key={l.slug} l={l} view={view} saved={saved.includes(l.slug)} hidden={hidden.includes(l.slug)} deal={deals[l.slug]} onHide={(s, on) => setHidden(on ? [...hidden, s] : hidden.filter((x) => x !== s))} />)}</div>
        : <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center"><p className="text-lg font-semibold">Nothing matches yet.</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Save this search and we will email you the moment a matching business is listed.</p><button type="button" onClick={() => setSaving("open")} className="btn btn-primary mt-5 !min-h-10"><Bell size={15} />Save this search</button></div>}
    </div>
  </div>;
}
