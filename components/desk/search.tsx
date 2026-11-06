"use client";
import Link from "next/link";
import { Search as Icon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
type R = { href: string; title: string; sub: string };
function useResults(q: string) {
  const [r, setR] = useState<R[]>([]);
  useEffect(() => { const t = setTimeout(async () => { if (q.trim().length < 2) return setR([]); const d = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`).then((x) => x.json()).catch(() => ({ results: [] })); setR(d.results ?? []); }, 180); return () => clearTimeout(t); }, [q]);
  return r;
}
const List = ({ r, done }: { r: R[]; done: () => void }) => <ul className="overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">{r.length ? r.map((x) => <li key={x.href}><Link href={x.href} onClick={done} className="block px-3 py-2.5 text-sm hover:bg-accent"><b className="block font-semibold">{x.title}</b><span className="text-xs text-muted-foreground">{x.sub}</span></Link></li>) : <li className="px-3 py-2.5 text-sm text-muted-foreground">No matches</li>}</ul>;
/** Header search. Inline on wide screens, a full-width bar on phones. */
export function Search() {
  const [q, setQ] = useState(""); const r = useResults(q); const [open, setOpen] = useState(false); const box = useRef<HTMLInputElement>(null);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "/" && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) { e.preventDefault(); if (innerWidth < 768) setOpen(true); else box.current?.focus(); } }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const done = () => { setQ(""); setOpen(false); };
  return <>
    <div className="relative hidden md:block"><label className="sr-only" htmlFor="global-search">Search buyers and listings</label><Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input ref={box} id="global-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyers, listings" autoComplete="off" className="h-9 w-56 rounded-md border bg-background pl-8 pr-8 text-sm outline-none focus:border-foreground/40 lg:w-72" /><kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border px-1.5 text-[10px] text-muted-foreground">/</kbd>
      {q.trim().length >= 2 && <div className="absolute right-0 z-50 mt-1 w-80"><List r={r} done={done} /></div>}</div>
    <button id="mobile-search" type="button" aria-label="Search" onClick={() => setOpen(true)} className="grid size-9 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"><Icon size={18} /></button>
    {open && <div className="fixed inset-x-0 top-0 z-50 border-b bg-background p-3 shadow-lg md:hidden"><div className="flex items-center gap-2"><div className="relative flex-1"><Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input autoFocus aria-label="Search buyers and listings" id="global-search-m" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyers, listings" autoComplete="off" className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-base outline-none" /></div><button type="button" aria-label="Close search" onClick={done} className="grid size-11 place-items-center rounded-md border"><X size={18} /></button></div>{q.trim().length >= 2 && <div className="mt-2"><List r={r} done={done} /></div>}</div>}
  </>;
}
