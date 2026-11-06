"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Empty, StagePill } from "./shell";

export type Row = { id: string; name: string; email: string; listing: string; stage: string; stageLabel: string; route: string; source: string; updatedAt: string; age: string; archived: boolean; score: number };
export function BuyersTable({ rows, stages, listings }: { rows: Row[]; stages: [string, string][]; listings: string[] }) {
  const [q, setQ] = useState(""); const [stage, setStage] = useState(""); const [listing, setListing] = useState(""); const [source, setSource] = useState(""); const [arch, setArch] = useState(false);
  const sources = [...new Set(rows.map((r) => r.source))];
  const shown = useMemo(() => rows.filter((r) => r.archived === arch && (!stage || r.stage === stage) && (!listing || r.listing === listing) && (!source || r.source === source) && (!q || `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, stage, listing, source, arch]);
  const sel = "input !min-h-10 !py-1.5 !text-sm lg:!w-auto";
  return (<>
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="relative min-w-52 flex-1"><span className="sr-only">Search buyers</span><Search size={16} className="absolute left-3 top-3 text-muted-foreground" /><input id="buyer-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="input !min-h-10 !py-1.5 !pl-9 !text-sm" /></label>
      <select aria-label="Stage" id="f-stage" className={sel} value={stage} onChange={(e) => setStage(e.target.value)}><option value="">All stages</option>{stages.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <select aria-label="Listing" id="f-listing" className={sel} value={listing} onChange={(e) => setListing(e.target.value)}><option value="">All listings</option>{listings.map((l) => <option key={l}>{l}</option>)}</select>
      <select aria-label="Source" id="f-source" className={sel} value={source} onChange={(e) => setSource(e.target.value)}><option value="">All sources</option>{sources.map((s) => <option key={s}>{s}</option>)}</select>
      <button aria-pressed={arch} onClick={() => setArch(!arch)} className="btn btn-ghost !min-h-10 !text-sm">{arch ? "Showing archived" : "Archived"}</button>
      <a href="/api/admin/export?type=buyers" className="btn btn-ghost !min-h-10 !text-sm"><Download size={15} /> Export CSV</a>
    </div>
    {shown.length ? <><ul className="tablebox divide-y overflow-hidden md:hidden">{shown.map((r) => <li key={r.id}><Link href={`/admin/buyers/${r.id}`} className="flex items-center gap-3 p-4 active:bg-muted"><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><b className="truncate font-semibold">{r.name}</b><span className="num shrink-0 text-xs text-muted-foreground">{r.age}</span></span><span className="block truncate text-sm text-muted-foreground">{r.listing}</span><span className="mt-2 flex items-center gap-2"><StagePill stage={r.stage} label={r.stageLabel} /><span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"><span className="block h-1 w-10 rounded bg-muted"><i className="block h-full rounded bg-brand" style={{ width: `${r.score}%` }} /></span><span className="num">{r.score}</span></span></span></span></Link></li>)}</ul><div className="hidden tablebox overflow-x-auto md:block"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b bg-surface-1 text-xs text-muted-foreground"><tr>{["Buyer", "Readiness", "Listing", "Stage", "Route", "Source", "Updated"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
      <tbody>{shown.map((r) => <tr key={r.id} className="border-b last:border-0 hover:bg-muted/60"><td className="px-4 py-3"><Link href={`/admin/buyers/${r.id}`} className="font-semibold hover:text-brand">{r.name}</Link><span className="block text-xs text-muted-foreground">{r.email}</span></td><td className="px-4 py-3"><span className="num font-medium">{r.score}</span><span className="mt-1 block h-1 w-14 rounded bg-muted"><i className="block h-full rounded bg-brand" style={{ width: `${r.score}%` }} /></span></td><td className="px-4 py-3 text-muted-foreground">{r.listing}</td><td className="px-4 py-3"><StagePill stage={r.stage} label={r.stageLabel} /></td><td className="px-4 py-3 text-muted-foreground">{r.route}</td><td className="px-4 py-3 text-muted-foreground">{r.source}</td><td className="num px-4 py-3 text-muted-foreground">{r.age}</td></tr>)}</tbody></table></div></>
    : <Empty title="No buyers match" text="Clear a filter, or wait for the next inquiry." />}
    <p className="mt-3 text-sm text-muted-foreground">{shown.length} of {rows.filter((r) => r.archived === arch).length} buyers</p>
  </>);
}
