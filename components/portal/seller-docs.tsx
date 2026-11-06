"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import type { SellerDoc } from "@/lib/seller";
const folders = ["Financials", "Tax returns", "Operations", "Legal", "Customers", "Other"];
/** The seller's documents by folder, with uploads straight to the advisor. */
export function SellerDocs({ id, docs, canDelete }: { id: string; docs: SellerDoc[]; canDelete: boolean }) {
  const router = useRouter(); const [folder, setFolder] = useState("Financials"); const [up, setUp] = useState(""); const [err, setErr] = useState("");
  const upload = async (files: FileList | null) => { if (!files) return; setErr(""); for (const f of Array.from(files)) { setUp(f.name); const fd = new FormData(); fd.append("file", f); fd.append("folder", folder); const r = await fetch(`/api/account/sell/${id}/docs`, { method: "POST", body: fd }); const d = await r.json().catch(() => ({})); if (!r.ok) { setErr(d.error ?? "Upload failed."); break; } } setUp(""); router.refresh(); };
  const groups = folders.map((f) => [f, docs.filter((d) => d.folder === f)] as const).filter(([, x]) => x.length);
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="space-y-5">{groups.length ? groups.map(([f, rows]) => <section key={f} className="panel"><div className="panel-head"><FileText size={17} className="text-muted-foreground" /><h2 className="flex-1">{f}</h2><span className="num text-xs text-muted-foreground">{rows.length}</span></div><div className="well well-flush"><ul className="divide-y">{rows.map((d) => <li key={d.fileId} className="flex items-center gap-3 px-4 py-3 text-sm"><FileText size={15} className="shrink-0 text-muted-foreground" /><a href={`/api/account/sell/${id}/docs?file=${encodeURIComponent(d.fileId)}`} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-medium hover:text-c-orange">{d.name}</a><span className="num shrink-0 text-xs text-muted-foreground">{d.at.slice(0, 10)}</span>{canDelete && <button type="button" onClick={async () => { await fetch(`/api/account/sell/${id}/docs?file=${encodeURIComponent(d.fileId)}`, { method: "DELETE" }); router.refresh(); }} className="cursor-pointer text-xs text-muted-foreground hover:text-destructive">Remove</button>}</li>)}</ul></div></section>) : <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center"><p className="font-semibold">No documents yet</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Start with a P&amp;L or tax return. Your advisor uses these to verify the numbers.</p></div>}</div>
    <aside className="panel lg:sticky lg:top-[130px] lg:self-start"><div className="panel-head"><Upload size={17} className="text-muted-foreground" /><h2>Upload</h2></div><div className="well space-y-3">
      <label className="field" htmlFor="sd-folder">Folder<select id="sd-folder" className="input" value={folder} onChange={(e) => setFolder(e.target.value)}>{folders.map((f) => <option key={f}>{f}</option>)}</select></label>
      <label htmlFor="sd-file" className="grid cursor-pointer place-items-center rounded-xl border border-dashed p-6 text-center text-sm hover:border-c-orange"><Upload size={18} className="mb-2 text-muted-foreground" />{up ? `Uploading ${up}…` : "Choose files"}<span className="mt-1 text-xs text-muted-foreground">PDF, Excel, CSV or images. Up to 4 MB each.</span><input id="sd-file" type="file" multiple className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls" onChange={(e) => upload(e.target.files)} /></label>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <p className="text-xs text-muted-foreground">Only your advisor sees these. Nothing reaches buyers until you agree what goes in the deal room.</p>
    </div></aside>
  </div>;
}
