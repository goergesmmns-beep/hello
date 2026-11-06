"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Listing } from "@/content/listings";
import { ListingCard } from "./listing-card";

const prices = [["any", "Any price"], ["0-250000", "Under $250K"], ["250000-1000000", "$250K to $1M"], ["1000000-5000000", "$1M to $5M"], ["5000000-", "$5M and up"]] as const;
const sorts = [["featured", "Featured"], ["price-desc", "Price, high to low"], ["price-asc", "Price, low to high"], ["revenue", "Revenue, high to low"]] as const;
type F = { q: string; cat: string; price: string; sort: string; open: boolean };
const blank: F = { q: "", cat: "all", price: "any", sort: "featured", open: false };

/** Filterable marketplace. Filters live in the address bar so a search can be shared. */
export function Market({ listings }: { listings: Listing[] }) {
  const [f, setF] = useState<F>(blank); const [more, setMore] = useState(false);
  useEffect(() => { const p = new URLSearchParams(location.search); setF({ q: p.get("q") ?? "", cat: p.get("cat") ?? "all", price: p.get("price") ?? "any", sort: p.get("sort") ?? "featured", open: p.get("open") === "1" }); }, []);
  useEffect(() => { const p = new URLSearchParams(); if (f.q) p.set("q", f.q); if (f.cat !== "all") p.set("cat", f.cat); if (f.price !== "any") p.set("price", f.price); if (f.sort !== "featured") p.set("sort", f.sort); if (f.open) p.set("open", "1"); history.replaceState(null, "", `${location.pathname}${p.size ? `?${p}` : ""}`); }, [f]);
  const set = (x: Partial<F>) => setF((o) => ({ ...o, ...x }));
  const cats = useMemo(() => [...new Set(listings.map((l) => l.category))].map((c) => [c, listings.filter((l) => l.category === c).length] as const), [listings]);
  const rows = useMemo(() => {
    const [lo, hi] = f.price === "any" ? [0, Infinity] : f.price.split("-").map((x, i) => (x ? Number(x) : i ? Infinity : 0));
    const q = f.q.toLowerCase().trim();
    const r = listings.filter((l) => (f.cat === "all" || l.category === f.cat) && (!f.open || l.status !== "pending") && (f.price === "any" || (l.askUsd !== null && l.askUsd >= lo && l.askUsd < hi)) && (!q || `${l.title} ${l.headline} ${l.summary} ${l.category}`.toLowerCase().includes(q)));
    if (f.sort === "price-desc") r.sort((a, b) => (b.askUsd ?? -1) - (a.askUsd ?? -1));
    if (f.sort === "price-asc") r.sort((a, b) => (a.askUsd ?? Infinity) - (b.askUsd ?? Infinity));
    if (f.sort === "revenue") r.sort((a, b) => (b.revenueUsd ?? -1) - (a.revenueUsd ?? -1));
    return r;
  }, [listings, f]);
  const active = (f.q ? 1 : 0) + (f.cat !== "all" ? 1 : 0) + (f.price !== "any" ? 1 : 0) + (f.open ? 1 : 0);
  const chip = (on: boolean) => `shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${on ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`;
  const sel = "input !min-h-10 !w-auto !py-1.5 !pr-8 !text-sm";
  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 mb-6 border-b bg-background/90 px-5 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-4">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1"><span className="sr-only">Search listings</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="market-search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search SaaS, agency, subscription…" className="input !min-h-10 !py-1.5 !pl-9 !text-[15px]" /></label>
          <div className="hidden items-center gap-2 md:flex"><label className="sr-only" htmlFor="market-price">Price</label><select id="market-price" className={sel} value={f.price} onChange={(e) => set({ price: e.target.value })}>{prices.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select><label className="sr-only" htmlFor="market-sort">Sort</label><select id="market-sort" className={sel} value={f.sort} onChange={(e) => set({ sort: e.target.value })}>{sorts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="btn btn-ghost !min-h-10 !px-3 md:hidden"><SlidersHorizontal size={16} />{active > 0 && <span className="num grid size-5 place-items-center rounded-full bg-brand text-[11px] text-brand-foreground">{active}</span>}</button>
        </div>
        {more && <div className="mt-2 grid grid-cols-2 gap-2 md:hidden"><select aria-label="Price" className="input !min-h-10 !text-sm" value={f.price} onChange={(e) => set({ price: e.target.value })}>{prices.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select><select aria-label="Sort" className="input !min-h-10 !text-sm" value={f.sort} onChange={(e) => set({ sort: e.target.value })}>{sorts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>}
        <div className="-mx-5 mt-3 flex items-center gap-2 overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Category">
          <button type="button" aria-pressed={f.cat === "all"} className={chip(f.cat === "all")} onClick={() => set({ cat: "all" })}>All <span className="num opacity-60">{listings.length}</span></button>
          {cats.map(([c, n]) => <button key={c} type="button" aria-pressed={f.cat === c} className={chip(f.cat === c)} onClick={() => set({ cat: c })}>{c} <span className="num opacity-60">{n}</span></button>)}
          <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap pl-2 text-sm text-muted-foreground" htmlFor="market-open"><input id="market-open" type="checkbox" checked={f.open} onChange={(e) => set({ open: e.target.checked })} className="size-4 accent-black" />Hide sale pending</label>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground"><p aria-live="polite"><span className="num text-foreground">{rows.length}</span> {rows.length === 1 ? "business" : "businesses"}</p>{active > 0 && <button type="button" onClick={() => setF({ ...blank, sort: f.sort })} className="flex cursor-pointer items-center gap-1 hover:text-foreground"><X size={14} /> Clear filters</button>}</div>
      {rows.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{rows.map((l) => <ListingCard key={l.slug} l={l} />)}</div>
        : <div className="rounded-2xl border border-dashed p-10 text-center"><p className="text-lg font-semibold">Nothing matches yet.</p><p className="mt-1 text-muted-foreground">Set a deal alert below and we will email you when one does.</p><a href="#alerts" className="btn btn-primary mt-5">Set a deal alert</a></div>}
    </div>
  );
}
