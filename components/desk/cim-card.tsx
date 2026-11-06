"use client";
import { useState } from "react";
import { Eye, FileText, Upload } from "lucide-react";
import { Card } from "./panel";
type V = { v: number; name: string; at: string; size: number };
/** CIM upload with version history, advisor preview and optional buyer notice. */
export function CimCard({ slug, initial, hasFile }: { slug: string; initial: V[]; hasFile: boolean }) {
  const [list, setList] = useState(initial); const [notify, setNotify] = useState(true); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const cur = list.at(-1); const has = hasFile || !!cur;
  const upload = async (f: File) => { setBusy(true); setErr(""); setMsg(""); const fd = new FormData(); fd.append("file", f); fd.append("notify", String(notify)); const r = await fetch(`/api/admin/listings/${slug}/cim`, { method: "POST", body: fd }); const d = await r.json().catch(() => ({})); setBusy(false); if (!r.ok) return setErr(d.error ?? "Upload failed."); setList(d.versions); setMsg(`Version ${d.version} is live.${d.told ? ` ${d.told} ${d.told === 1 ? "buyer was" : "buyers were"} told.` : ""}`); };
  return <Card title="CIM" sub={cur ? `Version ${cur.v}` : has ? "Uploaded" : "Not uploaded"}>
    {!has && <p className="mb-3 rounded-lg border border-c-orange/50 bg-c-orange/10 p-3 text-sm">Buyers see a sample page until you upload the CIM.</p>}
    {cur && <div className="mb-3 flex items-center gap-3 rounded-xl border bg-surface-1 p-3"><FileText size={18} className="shrink-0 text-c-orange" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{cur.name}</p><p className="text-xs text-muted-foreground">{cur.at.slice(0, 10)} · {(cur.size / 1024 / 1024).toFixed(1)} MB</p></div><a href={`/api/admin/listings/${slug}/cim`} target="_blank" rel="noreferrer" className="tbtn !h-8 !px-2.5 !text-[13px]"><Eye size={14} />Preview</a></div>}
    <label className="btn btn-ghost w-full cursor-pointer" htmlFor="cim-file"><Upload size={16} /> {busy ? "Uploading…" : has ? "Upload a new version" : "Upload CIM"}</label><input id="cim-file" type="file" accept="application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    {has && <label className="mt-3 flex items-start gap-2 text-sm"><input id="cim-notify" type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="mt-0.5 size-4 accent-[var(--c-orange)]" />Email buyers who already have the CIM when I upload a new version</label>}
    <p className="mt-2 text-xs text-muted-foreground">PDF under 4 MB. Every buyer copy is stamped with their email, IP address and the time.</p>
    {msg && <p role="status" className="mt-2 text-sm">{msg}</p>}{err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
    {list.length > 1 && <details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Version history</summary><ul className="mt-2 space-y-1.5">{[...list].reverse().map((x) => <li key={x.v} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate"><span className="num mr-2 text-muted-foreground">v{x.v}</span>{x.name}</span><a href={`/api/admin/listings/${slug}/cim?v=${x.v}`} target="_blank" rel="noreferrer" className="shrink-0 text-xs underline">Preview</a></li>)}</ul></details>}
  </Card>;
}
