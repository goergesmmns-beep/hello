"use client";
import { useRef, useState } from "react";
import { FileText, ShieldCheck, Upload, X } from "lucide-react";
import { money } from "@/content/listings";

const docTypes = ["Bank statement", "Brokerage or investment statement", "Bank letter", "Lender pre-qualification letter", "Other"];
export function FundsForm({ token, floor, note, existing, onDone }: { token: string; floor: number | null; note?: string; existing: string[]; onDone: (b: never) => void }) {
  const [files, setFiles] = useState<File[]>([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null); const [sent, setSent] = useState(existing);
  const add = (l: FileList | null) => { const picked = l ? Array.from(l) : []; setFiles((f) => [...f, ...picked].slice(0, 5)); setErr(""); };
  return <form className="space-y-4" onSubmit={async (e) => {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    if (!files.length && !sent.length) return setErr("Add at least one document.");
    setBusy(true); setErr("");
    for (const f of files) {
      const fd = new FormData(); fd.append("file", f);
      const r = await fetch(`/api/access/${token}/funds`, { method: "POST", body: fd }); const d = await r.json().catch(() => ({}));
      setFiles((x) => x.filter((y) => y !== f));
      if (!r.ok) { setBusy(false); return setErr(d.error ?? "Upload failed. Try again."); }
      setSent((x) => [...x, f.name]);
    }
    const stated = String(form.get("stated") ?? "").replace(/\D/g, "");
    const r = await fetch(`/api/access/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "funds", docType: form.get("docType"), statedUsd: stated ? Number(stated) : undefined, docDate: form.get("docDate") || undefined }) });
    const d = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { onDone(d as never); window.scrollTo(0, 0); } else setErr(d.error ?? "That did not send. Try again.");
  }}>
    <h1 className="text-3xl font-semibold">Confirm your proof of funds</h1>
    {note && <p role="status" className="rounded-md border border-brand bg-brand/15 p-3 text-sm"><b className="block">An advisor needs more from you</b>{note}</p>}
    {floor && <div className="flex items-baseline justify-between rounded-md border p-3"><span className="text-sm text-muted-foreground">Suggested for this listing</span><span className="num text-lg font-medium">{money(floor)}</span></div>}
    <label className="field" htmlFor="docType">Document type<select id="docType" name="docType" className="input" defaultValue={docTypes[0]}>{docTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
    <div className="grid grid-cols-2 gap-3"><label className="field" htmlFor="stated">Amount shown, USD<input id="stated" name="stated" inputMode="numeric" className="input num" placeholder="250,000" /></label><label className="field" htmlFor="docDate">Document date<input id="docDate" name="docDate" type="date" className="input" /></label></div>
    <label htmlFor="file" onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }} className={`block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${over ? "border-brand bg-brand/10" : "hover:border-foreground/50"}`}><Upload size={22} className="mx-auto mb-2 text-brand-ink" /><span className="block font-semibold">Add documents</span><span className="text-sm text-muted-foreground">Upload or take a photo. PDF, PNG or JPG, under 4 MB each.</span><input ref={input} id="file" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,image/*" className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} /></label>
    {(sent.length > 0 || files.length > 0) && <ul className="space-y-1.5">{sent.map((n, i) => <li key={`e${i}`} className="flex items-center gap-2 rounded-md border p-2 text-sm"><FileText size={16} className="text-brand-ink" /><span className="truncate">{n}</span><span className="ml-auto text-xs text-muted-foreground">Uploaded</span></li>)}{files.map((f, i) => <li key={i} className="flex items-center gap-2 rounded-md border p-2 text-sm"><FileText size={16} /><span className="truncate">{f.name}</span><button type="button" aria-label={`Remove ${f.name}`} className="ml-auto cursor-pointer" onClick={() => setFiles((x) => x.filter((_, n) => n !== i))}><X size={16} /></button></li>)}</ul>}
    <p className="flex gap-2 text-sm text-muted-foreground"><ShieldCheck size={18} className="shrink-0 text-brand-ink" />You can hide account numbers. Only advisors can open these files, they never go to the CRM, and they are deleted after 30 days.</p>
    {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Send to an advisor"}</button>
  </form>;
}
