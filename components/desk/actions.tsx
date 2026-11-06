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
export function FundsReview({ id, floor, stated, stage }: { id: string; floor: number | null; stated?: number; stage: string }) {
  const { busy, msg, go } = useAct(id); const [amt, setAmt] = useState(stated ? String(stated) : ""); const [note, setNote] = useState(""); const [ask, setAsk] = useState(false);
  const n = Number(amt.replace(/\D/g, "")); const short = !!floor && n > 0 && n < floor; const can = !["cim", "call"].includes(stage);
  return <div className="space-y-3 border-t pt-3">
    <label className="field" htmlFor="verified">Verified amount, USD<input id="verified" inputMode="numeric" className="input num" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="250,000" /></label>
    {short && <p role="status" className="text-sm text-destructive">Below the suggested amount of ${floor!.toLocaleString("en-US")} for this listing.</p>}
    <div className="flex flex-wrap gap-2">{can && <button id="verify-release" disabled={busy || !n} className="btn btn-brand !min-h-10" onClick={() => go({ action: "funds-verify", amount: n, release: true })}>Verify and release CIM</button>}<button id="verify-only" disabled={busy || !n} className="btn btn-ghost !min-h-10" onClick={() => go({ action: "funds-verify", amount: n, release: false })}>Verify only</button><button id="ask-more" disabled={busy} className="btn btn-ghost !min-h-10" aria-expanded={ask} onClick={() => setAsk(!ask)}>Request more</button><button id="not-enough" disabled={busy} className="btn btn-ghost !min-h-10" onClick={() => go({ action: "funds-decline" })}>Not sufficient</button></div>
    {ask && <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); if (note.trim()) { await go({ action: "funds-more", note: note.trim() }); setNote(""); setAsk(false); } }}><label className="field" htmlFor="more-note">What the buyer needs to send<textarea id="more-note" rows={3} className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="The statement is over 90 days old. Please send the latest one." /></label><button id="send-more" disabled={busy || !note.trim()} className="btn btn-primary !min-h-9">Email the buyer</button></form>}
    {msg && <p role="status" className="text-sm text-destructive">{msg}</p>}
  </div>;
}
const offerStatuses = ["Draft", "Submitted", "Countered", "Accepted", "Declined", "Withdrawn"];
export function OfferForm({ id }: { id: string }) {
  const { busy, go } = useAct(id); const [open, setOpen] = useState(false);
  if (!open) return <button id="new-offer" className="btn btn-ghost !min-h-9" onClick={() => setOpen(true)}>Log an offer</button>;
  const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\D/g, ""));
  return <form className="space-y-2.5" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); await go({ action: "offer", amountUsd: num(f.get("amountUsd")), cashUsd: num(f.get("cashUsd")), sellerNoteUsd: num(f.get("sellerNoteUsd")), earnoutUsd: num(f.get("earnoutUsd")), status: f.get("status"), notes: f.get("notes") }); setOpen(false); }}>
    <div className="grid grid-cols-2 gap-2.5"><label className="field" htmlFor="amountUsd">Total offer, USD<input id="amountUsd" name="amountUsd" required inputMode="numeric" className="input num" /></label><label className="field" htmlFor="status">Status<select id="status" name="status" className="input" defaultValue="Submitted">{offerStatuses.map((s) => <option key={s}>{s}</option>)}</select></label><label className="field" htmlFor="cashUsd">Cash at close<input id="cashUsd" name="cashUsd" inputMode="numeric" className="input num" /></label><label className="field" htmlFor="sellerNoteUsd">Seller note<input id="sellerNoteUsd" name="sellerNoteUsd" inputMode="numeric" className="input num" /></label><label className="field" htmlFor="earnoutUsd">Earnout<input id="earnoutUsd" name="earnoutUsd" inputMode="numeric" className="input num" /></label></div>
    <label className="field" htmlFor="offer-notes">Terms and notes<textarea id="offer-notes" name="notes" rows={2} className="input" /></label>
    <div className="flex gap-2"><button id="save-offer" disabled={busy} className="btn btn-primary !min-h-9">Save offer</button><button type="button" className="btn btn-ghost !min-h-9" onClick={() => setOpen(false)}>Cancel</button></div></form>;
}
export function OfferStatusSelect({ id, offerId, status }: { id: string; offerId: string; status: string }) {
  const { busy, go } = useAct(id);
  return <select aria-label="Offer status" disabled={busy} className="input !min-h-8 !w-auto !py-0.5 !text-[13px]" value={status} onChange={(e) => go({ action: "offer-status", offerId, status: e.target.value })}>{offerStatuses.map((s) => <option key={s}>{s}</option>)}</select>;
}
export function TaskForm({ id }: { id: string }) {
  const { busy, go } = useAct(id); const [t, setT] = useState(""); const [due, setDue] = useState("");
  return <form className="flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); if (t.trim()) { await go({ action: "task", text: t.trim(), due }); setT(""); setDue(""); } }}><label className="sr-only" htmlFor="task">New task</label><input id="task" value={t} onChange={(e) => setT(e.target.value)} placeholder="Add a follow-up" className="input !min-h-9 min-w-40 flex-1 !py-1 !text-sm" /><label className="sr-only" htmlFor="due">Due date</label><input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="input !min-h-9 !w-auto !py-1 !text-sm" /><button id="add-task" disabled={busy || !t.trim()} className="btn btn-ghost !min-h-9">Add</button></form>;
}
export function TaskCheck({ id, taskId, done, text }: { id: string; taskId: string; done?: boolean; text: string }) {
  const { busy, go } = useAct(id); const [on, setOn] = useState(!!done);
  return <label className="flex min-w-0 items-start gap-2 text-sm"><input type="checkbox" checked={on} disabled={busy} onChange={() => { setOn(!on); go({ action: "task-toggle", taskId }); }} className="mt-0.5 size-4 accent-black" /><span className={on ? "text-muted-foreground line-through" : ""}>{text}</span></label>;
}
export function PrintButton() { return <button className="btn btn-primary !min-h-10 print:hidden" onClick={() => window.print()}>Print or save as PDF</button>; }
export function AnswerForm({ id, qid }: { id: string; qid: string }) {
  const { busy, go } = useAct(id); const [a, setA] = useState("");
  return <form className="mt-2 space-y-2" onSubmit={async (e) => { e.preventDefault(); if (a.trim()) { await go({ action: "answer", qid, a: a.trim() }); setA(""); } }}><label className="sr-only" htmlFor={`ans-${qid}`}>Answer</label><textarea id={`ans-${qid}`} rows={2} className="input !text-sm" value={a} onChange={(e) => setA(e.target.value)} placeholder="Answer. The buyer gets an email and sees it in the deal room." /><button disabled={busy || !a.trim()} className="btn btn-primary !min-h-9">Send answer</button></form>;
}
export function SyncButton({ id }: { id: string }) {
  const { busy, msg, go } = useAct(id);
  return <span className="flex items-center gap-2"><button id="crm-sync" disabled={busy} className="btn btn-ghost !min-h-8 !px-2.5 !text-[13px]" onClick={() => go({ action: "crm-sync" }, "Synced.")}>{busy ? "Syncing…" : "Sync now"}</button>{msg && <span role="status" className="text-xs">{msg}</span>}</span>;
}
