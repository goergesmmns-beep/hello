"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download } from "lucide-react";
import type { Submission } from "@/lib/types";
import { Empty } from "./shell";
export function InboxList({ items }: { items: Submission[] }) {
  const router = useRouter(); const kinds = [...new Set(items.map((i) => i.kind))]; const [kind, setKind] = useState(""); const [open, setOpen] = useState<string | null>(null);
  const shown = items.filter((i) => !kind || i.kind === kind);
  const toggle = async (id: string, handled: boolean) => { await fetch("/api/admin/inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, handled }) }); router.refresh(); };
  return <>
    <div className="mb-4 flex flex-wrap items-center gap-2">{["", ...kinds].map((k) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={`btn !min-h-9 !text-sm ${kind === k ? "btn-brand" : "btn-ghost"}`}>{k || "All"}</button>)}<a href="/api/admin/export?type=inbox" className="btn btn-ghost !min-h-9 ml-auto !text-sm"><Download size={15} /> Export CSV</a></div>
    {shown.length ? <ul className="overflow-hidden rounded-xl border">{shown.map((s) => <li key={s.id} className="border-b last:border-0"><button aria-expanded={open === s.id} className="grid w-full cursor-pointer grid-cols-[10px_1fr_auto] items-center gap-3 p-4 text-left hover:bg-muted/60" onClick={() => setOpen(open === s.id ? null : s.id)}><i className={`size-2 rounded-full ${s.handled ? "bg-border" : "bg-brand"}`} /><span className="min-w-0"><b className="font-semibold">{s.fields.name || s.fields.email}</b><span className="block truncate text-sm text-muted-foreground">{s.kind} · {s.fields.company || s.fields.email}</span></span><span className="num text-xs text-muted-foreground">{s.createdAt.slice(0, 10)}</span></button>
      {open === s.id && <div className="px-9 pb-4"><dl className="space-y-1 text-sm">{Object.entries(s.fields).map(([k, v]) => <div key={k} className="grid gap-1 sm:grid-cols-[120px_1fr]"><dt className="capitalize text-muted-foreground">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>)}</dl><button className="btn btn-ghost mt-3 !min-h-9 !text-sm" onClick={() => toggle(s.id, !s.handled)}>{s.handled ? "Mark as new" : "Mark as handled"}</button></div>}</li>)}</ul> : <Empty title="Inbox is empty" text="Contact, seller, valuation and newsletter forms land here." />}
  </>;
}
