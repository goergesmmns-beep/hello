"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function RuleForm({ slug, gate, floor }: { slug: string; gate: string; floor: number | null }) {
  const router = useRouter(); const [g, setG] = useState(gate); const [f, setF] = useState(floor?.toString() ?? ""); const [msg, setMsg] = useState("");
  return <form className="flex flex-wrap items-end gap-2" onSubmit={async (e) => { e.preventDefault(); const r = await fetch("/api/admin/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, gate: g, floorUsd: f ? Number(f) : null }) }); setMsg(r.ok ? "Saved" : "Not saved"); router.refresh(); }}>
    <label className="field !text-xs" htmlFor={`g-${slug}`}>CIM release<select id={`g-${slug}`} className="input !min-h-9 !py-1 !text-sm" value={g} onChange={(e) => { setG(e.target.value); setMsg(""); }}><option value="after_review">After advisor review</option><option value="after_nda">Right after NDA</option></select></label>
    <label className="field !text-xs" htmlFor={`f-${slug}`}>Proof of funds, USD<input id={`f-${slug}`} inputMode="numeric" className="input num !min-h-9 w-32 !py-1 !text-sm" value={f} onChange={(e) => { setF(e.target.value.replace(/\D/g, "")); setMsg(""); }} /></label>
    <button id={`save-${slug}`} className="btn btn-ghost !min-h-9 !text-sm">Save</button>{msg && <span role="status" className="pb-2 text-sm text-muted-foreground">{msg}</span>}
  </form>;
}
