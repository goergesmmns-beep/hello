"use client";
import { Plus, Trash2 } from "lucide-react";
import type { Listing } from "@/content/listings";
import { Card } from "./shell";

/** Public fact sheet, growth levers and the figures used for multiples. */
export function ListingFacts({ l, set, growth, setGrowth }: { l: Listing; set: <K extends keyof Listing>(k: K, v: Listing[K]) => void; growth: string; setGrowth: (v: string) => void }) {
  const facts = l.facts ?? [];
  const num = (v: string) => { const x = v.replace(/\D/g, ""); return x ? Number(x) : undefined; };
  return <Card title="Fact sheet and multiples" sub="Public. Buyers see these on the listing page and cards." action={<button type="button" id="add-fact" className="btn btn-ghost !min-h-8 !px-2 !text-sm" onClick={() => set("facts", [...facts, { label: "", value: "" }])}><Plus size={15} /> Add fact</button>}><div className="space-y-5">
    {facts.length > 0 && <div className="space-y-2">{facts.map((f, i) => <div key={i} className="grid grid-cols-[1fr_1.4fr_40px] gap-2"><input aria-label="Fact label" id={`fl-${i}`} placeholder="Business model" className="input" value={f.label} onChange={(e) => set("facts", facts.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} /><input aria-label="Fact value" id={`fv-${i}`} placeholder="SaaS subscription" className="input" value={f.value} onChange={(e) => set("facts", facts.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} /><button type="button" aria-label="Remove fact" className="btn btn-ghost !min-h-10 !px-0" onClick={() => set("facts", facts.filter((_, j) => j !== i))}><Trash2 size={15} /></button></div>)}</div>}
    <div className="grid gap-3 sm:grid-cols-2"><label className="field" htmlFor="l-rev">Annual or TTM revenue, USD<input id="l-rev" inputMode="numeric" className="input num" value={l.revenueUsd ?? ""} onChange={(e) => set("revenueUsd", num(e.target.value))} /></label><label className="field" htmlFor="l-earn">SDE or net income, USD<input id="l-earn" inputMode="numeric" className="input num" value={l.earningsUsd ?? ""} onChange={(e) => set("earningsUsd", num(e.target.value))} /></label></div>
    <p className="-mt-2 text-xs text-muted-foreground">Leave blank for partial years or other currencies. Cards show the asking multiple when both price and a figure are set.</p>
    <label className="field" htmlFor="l-growth">Growth opportunities, one per line<textarea id="l-growth" rows={4} className="input" value={growth} onChange={(e) => setGrowth(e.target.value)} /></label>
  </div></Card>;
}
