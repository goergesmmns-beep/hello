"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const [err, setErr] = useState("");
  return <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }) }); if (res.ok) window.location.assign("/admin"); else setErr((await res.json()).error); }}>
    <label className="field" htmlFor="password">Password<input id="password" name="password" type="password" className="input" required autoFocus /></label>{err && <p role="alert" className="text-sm text-destructive">{err}</p>}<button className="btn btn-brand w-full">Sign in</button></form>;
}
function useAct(id: string) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const go = async (body: object, done = "") => { setBusy(true); setMsg(""); const r = await fetch(`/api/admin/buyers/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setBusy(false); if (r.ok) { setMsg(done); router.refresh(); } else setMsg("That did not work. Try again."); };
  return { busy, msg, go };
}
export function Decide({ id, stage, compact, archived, paused }: { id: string; stage: string; compact?: boolean; archived?: boolean; paused?: boolean }) {
  const { busy, msg, go } = useAct(id);
  const size = compact ? "!min-h-8 !px-2.5 !text-[13px]" : "!min-h-10";
  return <div className="flex flex-wrap items-center gap-2">
    {!["cim", "call"].includes(stage) && <button id={compact ? undefined : "release"} disabled={busy} className={`btn btn-brand ${size}`} onClick={() => go({ action: "release" })}>Release CIM</button>}
    {stage !== "warm" && <button id={compact ? undefined : "warm"} disabled={busy} className={`btn btn-ghost ${size}`} onClick={() => go({ action: "warm" })}>Keep warm</button>}
    {!compact && <><button id="resend" disabled={busy} className={`btn btn-ghost ${size}`} onClick={() => go({ action: "resend" }, "Link sent.")}>Resend link</button><button id="archive" disabled={busy} className={`btn btn-ghost ${size}`} onClick={() => go({ action: "archive", value: !archived })}>{archived ? "Restore" : "Archive"}</button><button id="toggle-reminders" disabled={busy} className={`btn btn-ghost ${size}`} onClick={() => go({ action: "reminders", value: !!paused })}>{paused ? "Resume reminders" : "Pause reminders"}</button></>}
    {msg && <span role="status" className="text-sm text-muted-foreground">{msg}</span>}
  </div>;
}
export function NoteForm({ id }: { id: string }) {
  const { busy, go } = useAct(id); const [t, setT] = useState("");
  return <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); if (t.trim()) { await go({ action: "note", text: t.trim() }); setT(""); } }}><label className="sr-only" htmlFor="note">Add a note</label><textarea id="note" value={t} onChange={(e) => setT(e.target.value)} rows={3} placeholder="Add a private note. It also goes to Pipedrive." className="input" /><button id="add-note" disabled={busy || !t.trim()} className="btn btn-ghost !min-h-9">Add note</button></form>;
}
export function Logout() { return <button className="text-sm text-muted-foreground hover:text-foreground" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); }}>Sign out</button>; }
