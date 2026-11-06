"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import type { Listing } from "@/content/listings";
import { Card } from "./shell";
import { RoomEditor } from "./room-editor";

const blank: Listing = { slug: "", title: "", headline: "", band: "under", category: "", status: "draft", askLabel: "", askUsd: null, metrics: [{ label: "", value: "" }], summary: "", highlights: [], body: [{ heading: "", text: "" }], gate: "after_review", floorUsd: null, idealBuyer: "any" };
export function ListingEditor({ listing, hasCim, docs = [] }: { listing?: Listing; hasCim?: boolean; docs?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [l, setL] = useState<Listing>(listing ?? blank);
  const [hl, setHl] = useState((listing?.highlights ?? []).join("\n"));
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [cim, setCim] = useState(hasCim);
  const set = <K extends keyof Listing>(k: K, v: Listing[K]) => { setL({ ...l, [k]: v }); setMsg(""); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(""); setMsg("");
    const r = await fetch("/api/admin/listings/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...l, highlights: hl.split("\n").map((x) => x.trim()).filter(Boolean), metrics: l.metrics.filter((m) => m.label && m.value), body: l.body.filter((b) => b.text), room: l.room ? { ...l.room, financials: l.room.financials?.filter((f) => f.period.trim()), faq: l.room.faq?.filter((f) => f.q.trim().length >= 3 && f.a.trim()) } : undefined }) });
    const d = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Not saved.");
    if (!listing) router.push(`/admin/listings/${d.slug}/edit`); else { setMsg("Saved."); router.refresh(); }
  };
  const upload = async (f: File) => {
    setErr(""); setMsg("Uploading…"); const fd = new FormData(); fd.append("file", f);
    const r = await fetch(`/api/admin/listings/${l.slug}/cim`, { method: "POST", body: fd }); const d = await r.json().catch(() => ({}));
    if (r.ok) { setCim(true); setMsg("CIM uploaded."); } else { setMsg(""); setErr(d.error ?? "Upload failed."); }
  };
  const T = (id: keyof Listing, label: string, req = false) => <label className="field" htmlFor={`l-${String(id)}`}>{label}<input id={`l-${String(id)}`} className="input" required={req} value={(l[id] as string) ?? ""} onChange={(e) => set(id, e.target.value as never)} /></label>;
  return (
    <form onSubmit={save} className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3">
        <Card title="Basics"><div className="grid gap-4 sm:grid-cols-2">{T("title", "Title", true)}{T("category", "Category", true)}<div className="sm:col-span-2">{T("headline", "Headline", true)}</div><label className="field sm:col-span-2" htmlFor="l-summary">Public summary<textarea id="l-summary" className="input" rows={3} required value={l.summary} onChange={(e) => set("summary", e.target.value)} /></label></div></Card>
        <Card title="Key figures" sub="Public, so show nothing that identifies the business." action={<button type="button" className="btn btn-ghost !min-h-8 !px-2 !text-sm" onClick={() => set("metrics", [...l.metrics, { label: "", value: "" }])}><Plus size={15} /> Add</button>}><div className="space-y-2">{l.metrics.map((m, i) => <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2"><input aria-label="Figure label" id={`m-l-${i}`} placeholder="TTM revenue" className="input" value={m.label} onChange={(e) => set("metrics", l.metrics.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)))} /><input aria-label="Figure value" id={`m-v-${i}`} placeholder="$1,200,000" className="input" value={m.value} onChange={(e) => set("metrics", l.metrics.map((x, n) => (n === i ? { ...x, value: e.target.value } : x)))} /><button type="button" aria-label="Remove figure" className="btn btn-ghost !px-2" onClick={() => set("metrics", l.metrics.filter((_, n) => n !== i))}><Trash2 size={15} /></button></div>)}</div></Card>
        <Card title="Description" action={<button type="button" className="btn btn-ghost !min-h-8 !px-2 !text-sm" onClick={() => set("body", [...l.body, { heading: "", text: "" }])}><Plus size={15} /> Add section</button>}><div className="space-y-4">{l.body.map((b, i) => <div key={i} className="space-y-2"><div className="grid grid-cols-[1fr_40px] gap-2"><input aria-label="Section heading" id={`b-h-${i}`} placeholder="Section heading" className="input" value={b.heading ?? ""} onChange={(e) => set("body", l.body.map((x, n) => (n === i ? { ...x, heading: e.target.value } : x)))} /><button type="button" aria-label="Remove section" className="btn btn-ghost !px-2" onClick={() => set("body", l.body.filter((_, n) => n !== i))}><Trash2 size={15} /></button></div><textarea aria-label="Section text" id={`b-t-${i}`} rows={4} className="input" value={b.text} onChange={(e) => set("body", l.body.map((x, n) => (n === i ? { ...x, text: e.target.value } : x)))} /></div>)}</div></Card>
        <Card title="Highlights" sub="One per line."><label className="sr-only" htmlFor="l-highlights">Highlights</label><textarea id="l-highlights" rows={5} className="input" value={hl} onChange={(e) => setHl(e.target.value)} /></Card>
        <RoomEditor slug={listing?.slug} room={l.room ?? {}} onChange={(r) => set("room", r)} docs={docs} />
      </div>
      <div className="min-w-0 space-y-3 xl:sticky xl:top-6 xl:self-start">
        <Card title="Publishing"><div className="space-y-4">
          <label className="field" htmlFor="l-status">Status<select id="l-status" className="input" value={l.status} onChange={(e) => set("status", e.target.value as Listing["status"])}><option value="draft">Hidden</option><option value="available">Available</option><option value="offers">Accepting offers</option><option value="pending">Sale pending</option><option value="sold">Sold, moves to the sold wall</option></select></label>
          {T("askLabel", "Asking price, as shown", true)}
          <label className="field" htmlFor="l-askUsd">Asking price in USD, numbers only<input id="l-askUsd" inputMode="numeric" className="input num" value={l.askUsd ?? ""} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); set("askUsd", v ? Number(v) : null); }} /></label>
          <button id="save-listing" disabled={busy} className="btn btn-brand w-full">{busy ? "Saving…" : listing ? "Save changes" : "Create listing"}</button>
          {msg && <p role="status" className="text-sm">{msg}</p>}{err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        </div></Card>
        <Card title="Buyer rules"><div className="space-y-4">
          <label className="field" htmlFor="l-gate">CIM release<select id="l-gate" className="input" value={l.gate} onChange={(e) => set("gate", e.target.value as Listing["gate"])}><option value="after_review">After advisor review</option><option value="after_nda">Right after NDA</option></select></label>
          <label className="field" htmlFor="l-floor">Proof of funds, USD<input id="l-floor" inputMode="numeric" className="input num" value={l.floorUsd ?? ""} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); set("floorUsd", v ? Number(v) : null); }} /></label>
          <label className="field" htmlFor="l-ideal">Best suited to<select id="l-ideal" className="input" value={l.idealBuyer} onChange={(e) => set("idealBuyer", e.target.value as Listing["idealBuyer"])}><option value="any">Any buyer</option><option value="strategic">Strategic acquirer</option></select></label>
        </div></Card>
        {listing && <Card title="CIM" sub={cim ? "Uploaded. Each buyer gets a stamped copy." : "Buyers see a sample page until you upload one."}><label className="btn btn-ghost w-full cursor-pointer" htmlFor="cim-file"><Upload size={16} /> {cim ? "Replace CIM" : "Upload CIM"}</label><input id="cim-file" type="file" accept="application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} /><p className="mt-2 text-xs text-muted-foreground">PDF under 4 MB. Larger files go in the project's private folder.</p></Card>}
      </div>
    </form>
  );
}
