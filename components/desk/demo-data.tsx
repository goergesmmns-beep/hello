"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Database, Trash2 } from "lucide-react";
export function DemoData({ count }: { count: number }) {
  const router = useRouter(); const [busy, setBusy] = useState(""); const [msg, setMsg] = useState("");
  const go = async (action: "load" | "clear") => { setBusy(action); setMsg(""); const r = await fetch("/api/admin/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); const d = await r.json().catch(() => ({})); setBusy(""); if (r.ok) { setMsg(action === "load" ? `Loaded ${d.buyers} sample buyers and ${d.inbox} inbox messages.` : `Removed ${d.removed} sample buyers.`); router.refresh(); } else setMsg(d.error ?? "That did not work."); };
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Fills the dashboard with realistic sample buyers, NDAs, proof of funds, offers, tasks and questions for recording a demo. Sample buyers use .example email addresses, so nothing is ever emailed, and they never sync to Pipedrive. Real buyers are never touched.</p>
    <p className="text-sm"><span className="num font-medium">{count}</span> sample buyers loaded now.</p>
    <div className="flex flex-wrap gap-2"><button id="demo-load" disabled={!!busy} onClick={() => go("load")} className="btn btn-brand !min-h-10"><Database size={16} />{busy === "load" ? "Loading…" : count ? "Reload demo data" : "Load demo data"}</button>{count > 0 && <button id="demo-clear" disabled={!!busy} onClick={() => go("clear")} className="btn btn-ghost !min-h-10"><Trash2 size={16} />{busy === "clear" ? "Removing…" : "Remove demo data"}</button>}</div>
    {msg && <p role="status" className="text-sm">{msg}</p>}
  </div>;
}
