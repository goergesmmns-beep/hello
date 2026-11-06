"use client";
import Link from "next/link";
import { Search as Icon } from "lucide-react";
import { useEffect, useState } from "react";
type R = { href: string; title: string; sub: string };
export function Search() {
  const [q, setQ] = useState(""); const [r, setR] = useState<R[]>([]);
  useEffect(() => { const t = setTimeout(async () => { if (q.trim().length < 2) return setR([]); const d = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`).then((x) => x.json()).catch(() => ({ results: [] })); setR(d.results ?? []); }, 180); return () => clearTimeout(t); }, [q]);
  return <div className="relative"><label className="sr-only" htmlFor="global-search">Search buyers and listings</label><Icon size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><input id="global-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" autoComplete="off" className="input !min-h-9 !py-1 !pl-8 !text-sm" />
    {q.trim().length >= 2 && <ul className="absolute z-40 mt-1 w-72 overflow-hidden rounded-lg border bg-popover shadow-lg">{r.length ? r.map((x) => <li key={x.href}><Link href={x.href} onClick={() => setQ("")} className="block px-3 py-2 text-sm hover:bg-accent"><b className="block font-semibold">{x.title}</b><span className="text-xs text-muted-foreground">{x.sub}</span></Link></li>) : <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>}</ul>}</div>;
}
