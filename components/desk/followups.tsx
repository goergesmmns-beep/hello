"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Followups } from "@/lib/reminders";

const when = [["Inquiry, no NDA", "1 day, then 4 days"], ["NDA signed, no funding step", "1 day, then 4 days"], ["CIM open, no call", "3 days, then 8 days"], ["Keep warm", "7 days, then 21 days"]];
export function FollowupSettings({ value, emailReady }: { value: Followups; emailReady: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(value.enabled); const [url, setUrl] = useState(value.bookingUrl ?? ""); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const post = async (body: object) => { setBusy(true); setErr(""); setMsg(""); const r = await fetch("/api/admin/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); setBusy(false); router.refresh(); return { r, d }; };
  const last = value.lastRun;
  return <div className="grid gap-6 lg:grid-cols-2">
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const { r, d } = await post({ enabled: on, bookingUrl: url }); if (r.ok) setMsg("Saved."); else setErr(d.error); }}>
      <label className="field" htmlFor="booking-url">Booking link<input id="booking-url" className="input" placeholder="https://calendly.com/your-name" value={url} onChange={(e) => setUrl(e.target.value)} /><span className="text-xs font-normal text-muted-foreground">Buyers see "Book a call" instead of "Request a call."</span></label>
      <label className="flex items-center gap-2.5 text-[15px]" htmlFor="followups-on"><input id="followups-on" type="checkbox" className="size-4 accent-[var(--brand)]" checked={on} onChange={(e) => setOn(e.target.checked)} />Send automatic buyer reminders</label>
      <div className="flex flex-wrap gap-2"><button id="save-followups" disabled={busy} className="btn btn-ghost !min-h-10">Save</button><button type="button" id="run-followups" disabled={busy} className="btn btn-ghost !min-h-10" onClick={async () => { const { d } = await post({ action: "run" }); setMsg(d.skipped ?? `${d.sent} ${d.sent === 1 ? "reminder" : "reminders"} sent.`); }}>Send due reminders now</button></div>
      {msg && <p role="status" className="text-sm">{msg}</p>}{err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {!emailReady && <p className="text-sm text-muted-foreground">Reminders start once live email is connected.</p>}
      {last && <p className="text-sm text-muted-foreground">Last run {last.at.slice(0, 16).replace("T", " ")} UTC: {last.skipped ?? `${last.sent} sent`}</p>}
    </form>
    <div><p className="mb-2 text-sm font-medium">Schedule</p><dl className="text-sm">{when.map(([a, b]) => <div key={a} className="flex justify-between gap-4 border-t py-2"><dt className="text-muted-foreground">{a}</dt><dd className="text-right">{b}</dd></div>)}</dl><p className="mt-2 text-xs text-muted-foreground">Runs daily. Reminders stop when a buyer moves on, unsubscribes or is archived. Advisors get a daily alert for reviews waiting over a day.</p></div>
  </div>;
}
