"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Database, Trash2 } from "lucide-react";
type DemoAcct = { id: string; name: string; email: string; roles: string[]; primary?: string; note: string };
/** Loads or clears the sample dataset, and opens any sample account's dashboard. */
export function DemoData({ count, accounts }: { count: number; accounts: DemoAcct[] }) {
  const router = useRouter(); const [busy, setBusy] = useState(""); const [msg, setMsg] = useState("");
  const call = (body: Record<string, unknown>) => fetch("/api/admin/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, d: await r.json().catch(() => ({})) }));
  const go = async (action: "load" | "clear") => { setBusy(action); setMsg(""); const { ok, d } = await call({ action }); setBusy(""); if (ok) { setMsg(action === "load" ? `Loaded ${d.buyers} buyer records, ${d.listings} extra listings, ${d.accounts} sign-in accounts, ${d.businesses} seller businesses and ${d.inbox} inbox messages.` : "Removed all sample data."); router.refresh(); } else setMsg(d.error ?? "That did not work."); };
  const open = async (id: string) => { setBusy(id); const { ok, d } = await call({ action: "open", id }); if (ok && d.next) { window.open(d.next, "_blank"); setBusy(""); } else { setBusy(""); setMsg(d.error ?? "Could not open it."); } };
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Fills the whole site with connected sample data: extra marketplace listings, buyers with NDAs, proof of funds, deal rooms and offers, buyer and seller accounts that own those deals and businesses, advisor threads, seller documents and 90 days of listing views. Sample people use .example addresses, so nothing is emailed or synced to Pipedrive. Real data is never touched.</p>
    <p className="text-sm"><span className="num font-medium">{count}</span> sample buyer records loaded now.</p>
    <div className="flex flex-wrap gap-2"><button id="demo-load" disabled={!!busy} onClick={() => go("load")} className="btn btn-brand !min-h-10"><Database size={16} />{busy === "load" ? "Loading… about 30 seconds" : count ? "Reload demo data" : "Load demo data"}</button>{count > 0 && <button id="demo-clear" disabled={!!busy} onClick={() => go("clear")} className="btn btn-ghost !min-h-10"><Trash2 size={16} />{busy === "clear" ? "Removing…" : "Remove demo data"}</button>}</div>
    {msg && <p role="status" className="text-sm">{msg}</p>}
    {accounts.length > 0 && <div><p className="mb-2 mt-2 text-[13px] font-medium text-muted-foreground">Sample accounts. Opening one signs this browser in as that person, in a new tab.</p><ul className="divide-y rounded-xl border">{accounts.map((a) => <li key={a.id} className="flex flex-wrap items-center gap-3 px-3.5 py-2.5 text-sm"><span className="min-w-0 flex-1"><b className="font-medium">{a.name}</b> <span className="text-muted-foreground">· {a.note}</span></span><span className="rounded-md border bg-surface-1 px-2 py-0.5 text-xs capitalize">{a.primary ?? a.roles[0]}{a.roles.length > 1 ? " + " + a.roles.find((r) => r !== a.primary) : ""}</span><button type="button" data-open-account={a.email} disabled={!!busy} onClick={() => open(a.id)} className="tbtn !h-8 !px-2.5 !text-[13px]">{busy === a.id ? "Opening…" : "Open dashboard"}<ArrowUpRight size={14} /></button></li>)}</ul></div>}
  </div>;
}
