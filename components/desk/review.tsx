"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
export function ReviewActions({ id, status, slug, checks, done }: { id: string; status: string; slug?: string; checks: readonly (readonly [string, string])[]; done: Record<string, boolean> }) {
  const router = useRouter(); const [d, setD] = useState(done); const [busy, setBusy] = useState(""); const [mode, setMode] = useState<"" | "changes" | "reject">(""); const [note, setNote] = useState(""); const [err, setErr] = useState("");
  const go = async (body: object, k: string) => { setBusy(k); setErr(""); const r = await fetch(`/api/admin/submissions/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const x = await r.json().catch(() => ({})); setBusy(""); if (!r.ok) return setErr(x.error ?? "That did not work."); setMode(""); setNote(""); if (x.slug) window.location.assign(`/admin/listings/${x.slug}/edit`); else if (!("key" in body)) router.refresh(); };
  const all = checks.every(([k]) => d[k]);
  return <div className="space-y-4">
    <ul className="space-y-1">{checks.map(([k, label]) => <li key={k}><label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-surface-1"><input id={`chk-${k}`} type="checkbox" checked={!!d[k]} onChange={(e) => { setD({ ...d, [k]: e.target.checked }); go({ action: "check", key: k, value: e.target.checked }, k); }} className="size-4 accent-[var(--c-green)]" />{label}</label></li>)}</ul>
    {status === "approved" ? <a href={`/admin/listings/${slug}/edit`} className="btn btn-primary w-full">Open the draft listing</a> : <div className="grid gap-2">
      {status === "submitted" && <button id="rv-start" disabled={!!busy} onClick={() => go({ action: "review" }, "review")} className="btn btn-ghost">Start review</button>}
      <button id="rv-approve" disabled={!!busy || !all} onClick={() => go({ action: "approve" }, "approve")} className="btn btn-brand">{busy === "approve" ? "Creating listing…" : <><Check size={16} /> Approve and create listing</>}</button>
      {!all && <p className="text-xs text-muted-foreground">Tick every check to approve.</p>}
      <div className="grid grid-cols-2 gap-2"><button id="rv-changes" onClick={() => setMode(mode === "changes" ? "" : "changes")} className="btn btn-ghost !min-h-10">Request changes</button><button id="rv-reject" onClick={() => setMode(mode === "reject" ? "" : "reject")} className="btn btn-ghost !min-h-10">Decline</button></div>
      {mode && <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) go({ action: mode, note }, mode); }}><label className="field" htmlFor="rv-note">{mode === "changes" ? "What should the owner change?" : "Reason, shared with the owner"}<textarea id="rv-note" rows={3} className="input" value={note} onChange={(e) => setNote(e.target.value)} /></label><button id="rv-send" disabled={!note.trim() || !!busy} className="btn btn-primary w-full !min-h-10">{mode === "changes" ? "Send to owner" : "Decline submission"}</button></form>}
    </div>}
    {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
  </div>;
}
