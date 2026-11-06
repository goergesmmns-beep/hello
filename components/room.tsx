"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Send } from "lucide-react";

const q = (token: string, v: string, path = "") => `/api/room/${token}${path}?v=${encodeURIComponent(v)}`;

/** Counts seconds each section is on screen and reports them in small batches. */
export function RoomTracker({ token, v }: { token: string; v: string }) {
  useEffect(() => {
    const seen = new Set<string>(); const acc: Record<string, number> = {};
    const io = new IntersectionObserver((es) => es.forEach((e) => { const id = (e.target as HTMLElement).dataset.room!; if (e.isIntersecting) seen.add(id); else seen.delete(id); }), { threshold: 0.35 });
    document.querySelectorAll<HTMLElement>("[data-room]").forEach((el) => io.observe(el));
    const tick = setInterval(() => { if (document.visibilityState === "visible") seen.forEach((id) => (acc[id] = (acc[id] ?? 0) + 1)); }, 1000);
    const flush = () => { if (!Object.keys(acc).length) return; const body = JSON.stringify({ sections: { ...acc } }); for (const k in acc) delete acc[k]; navigator.sendBeacon?.(q(token, v, "/track"), new Blob([body], { type: "application/json" })) || fetch(q(token, v, "/track"), { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }); };
    const every = setInterval(flush, 15000); const hide = () => document.visibilityState === "hidden" && flush();
    addEventListener("pagehide", flush); document.addEventListener("visibilitychange", hide);
    return () => { io.disconnect(); clearInterval(tick); clearInterval(every); removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", hide); flush(); };
  }, [token, v]);
  return null;
}

/** Section links that follow the reader. */
export function RoomNav({ items }: { items: [string, string][] }) {
  const [on, setOn] = useState<string | undefined>(items[0]?.[0]); const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setOn((v.target as HTMLElement).dataset.room); }, { rootMargin: "-20% 0px -65% 0px" });
    document.querySelectorAll<HTMLElement>("[data-room]").forEach((el) => io.observe(el)); return () => io.disconnect();
  }, []);
  useEffect(() => { bar.current?.querySelector<HTMLElement>(`[data-k="${on}"]`)?.scrollIntoView({ block: "nearest", inline: "center" }); }, [on]);
  return <div ref={bar} className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible">{items.map(([id, label]) => <a key={id} data-k={id} href={`#${id}`} aria-current={on === id ? "true" : undefined} className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors lg:py-2 ${on === id ? "bg-foreground font-medium text-background" : "text-muted-foreground hover:text-foreground"}`}>{label}</a>)}</div>;
}

type Q = { id: string; at: string; q: string; a?: string };
export function AskForm({ token, v, initial }: { token: string; v: string; initial: Q[] }) {
  const [list, setList] = useState(initial); const [t, setT] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  return <div className="space-y-4">
    {list.length > 0 && <ul className="space-y-3">{list.map((x) => <li key={x.id} className="rounded-lg border p-4"><p className="font-medium">{x.q}</p>{x.a ? <p className="mt-2 border-l-2 border-brand pl-3 text-muted-foreground">{x.a}</p> : <p className="mt-2 text-sm text-muted-foreground">An advisor will answer by email.</p>}</li>)}</ul>}
    <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(""); const r = await fetch(q(token, v), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "ask", q: t }) }); const d = await r.json().catch(() => ({})); setBusy(false); if (r.ok) { setList(d.questions); setT(""); } else setErr(d.error ?? "That did not send."); }}>
      <label className="field" htmlFor="room-q">Ask the advisor a question<textarea id="room-q" rows={3} className="input" value={t} onChange={(e) => setT(e.target.value)} placeholder="How much of revenue comes from the top five customers?" /></label>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <button id="room-ask" disabled={busy || t.trim().length < 5} className="btn btn-primary"><Send size={16} /> Send question</button>
    </form></div>;
}

export function InterestForm({ token, v, ask }: { token: string; v: string; ask: number | null }) {
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [err, setErr] = useState("");
  if (done) return <p role="status" className="flex gap-2 rounded-lg border border-brand bg-brand/10 p-4"><Check size={19} className="mt-0.5 shrink-0 text-brand-ink" />Received. An advisor will call you to talk through it. This is not binding.</p>;
  const num = (x: FormDataEntryValue | null) => { const s = String(x ?? "").replace(/\D/g, ""); return s ? Number(s) : undefined; };
  return <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const amountUsd = num(f.get("ioi-amount")); if (!amountUsd) return setErr("Enter a total amount."); setBusy(true); setErr(""); const r = await fetch(q(token, v), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "interest", amountUsd, cashUsd: num(f.get("ioi-cash")), sellerNoteUsd: num(f.get("ioi-note")), earnoutUsd: num(f.get("ioi-earnout")), notes: String(f.get("ioi-notes") ?? "") || undefined }) }); const d = await r.json().catch(() => ({})); setBusy(false); if (r.ok) setDone(true); else setErr(d.error ?? "That did not send."); }}>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="field sm:col-span-2" htmlFor="ioi-amount">Total price, USD<input id="ioi-amount" name="ioi-amount" inputMode="numeric" className="input num" placeholder={ask ? ask.toLocaleString("en-US") : "1,000,000"} required /></label>
      <label className="field" htmlFor="ioi-cash">Cash at close<input id="ioi-cash" name="ioi-cash" inputMode="numeric" className="input num" /></label>
      <label className="field" htmlFor="ioi-note">Seller note<input id="ioi-note" name="ioi-note" inputMode="numeric" className="input num" /></label>
      <label className="field" htmlFor="ioi-earnout">Earnout<input id="ioi-earnout" name="ioi-earnout" inputMode="numeric" className="input num" /></label>
      <label className="field sm:col-span-2" htmlFor="ioi-notes">Timing, financing and conditions<textarea id="ioi-notes" name="ioi-notes" rows={3} className="input" placeholder="Close in 60 days. SBA pre-qualified. Owner to stay 90 days." /></label>
    </div>
    {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    <button id="room-ioi" disabled={busy} className="btn btn-brand w-full sm:w-auto">{busy ? "Sending…" : "Send indication of interest"}</button>
    <p className="text-xs text-muted-foreground">Non-binding. It tells the advisor you are serious and starts the LOI conversation.</p>
  </form>;
}

type D = { id: string; name: string; folder: string; href: string; viewed: boolean };
const order = ["Overview", "Financials", "Operations", "Customers", "Legal", "Other"];
/** Numbered data room index with search and viewed status, like a VDR. */
export function DocIndex({ docs }: { docs: D[] }) {
  const [s, setS] = useState(""); const q = s.toLowerCase().trim();
  const groups = order.map((f) => [f, docs.filter((d) => d.folder === f && (!q || d.name.toLowerCase().includes(q)))] as const).filter(([, d]) => d.length);
  const seen = docs.filter((d) => d.viewed).length;
  return <div>
    <div className="mb-3 flex flex-wrap items-center gap-3"><label className="relative min-w-0 flex-1"><span className="sr-only">Search documents</span><svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg><input id="doc-search" value={s} onChange={(e) => setS(e.target.value)} placeholder="Search documents" className="input !min-h-10 !py-1.5 !pl-9 !text-[15px]" /></label><span className="num text-sm text-muted-foreground">{seen} of {docs.length} viewed</span></div>
    {groups.length ? <div className="overflow-hidden rounded-xl border">{groups.map(([f, list]) => { const n = order.indexOf(f) + 1; return <div key={f}><p className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2 text-sm font-semibold"><span className="num text-brand-ink">{n}.0</span>{f}<span className="num ml-auto text-xs font-normal text-muted-foreground">{list.length}</span></p><ul className="divide-y border-b last:border-b-0">{list.map((d, i) => <li key={d.id}><a href={d.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-accent"><span className="num w-9 shrink-0 text-xs text-muted-foreground">{n}.{i + 1}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium">{d.name}</span><span className="text-xs text-muted-foreground">PDF · stamped with your email, IP and time</span></span>{d.viewed ? <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">Viewed</span> : <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">New</span>}</a></li>)}</ul></div>; })}</div> : <p className="rounded-xl border p-6 text-center text-muted-foreground">No documents match.</p>}
  </div>;
}
