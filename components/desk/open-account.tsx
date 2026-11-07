"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
/** Opens a sample account's buyer or seller dashboard in a new tab. */
export function OpenAccount({ id, label = "Open dashboard" }: { id: string; label?: string }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  return <span className="inline-flex flex-col items-start"><button type="button" data-open-id={id} disabled={busy} onClick={async () => { const w = window.open("about:blank", "_blank"); setBusy(true); setErr(""); const r = await fetch("/api/admin/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "open", id }) }); const d = await r.json().catch(() => ({})); setBusy(false); if (r.ok && d.next) { if (w) w.location.href = d.next; else window.location.assign(d.next); } else { w?.close(); setErr(d.error ?? "Could not open it."); } }} className="tbtn !h-8 whitespace-nowrap !px-2.5 !text-[13px]">{busy ? "Opening…" : label}<ArrowUpRight size={14} /></button>{err && <span className="mt-1 text-xs text-destructive">{err}</span>}</span>;
}
