"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
type M = { id: string; at: string; from: "advisor" | "seller"; name: string; text: string };
/** Message thread between a seller and their advisor. `me` decides which side is on the right. */
export function Thread({ messages, endpoint, me, body = {} }: { messages: M[]; endpoint: string; me: "advisor" | "seller"; body?: Record<string, unknown> }) {
  const router = useRouter(); const [t, setT] = useState(""); const [busy, setBusy] = useState(false);
  return <div>
    {messages.length ? <ol className="max-h-[420px] space-y-3 overflow-y-auto pr-1">{messages.map((m) => { const mine = m.from === me; return <li key={m.id} className={`flex ${mine ? "justify-end" : ""}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] ${mine ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md border bg-surface-1"}`}><p className="whitespace-pre-line">{m.text}</p><p className={`mt-1 text-[11px] ${mine ? "text-background/60" : "text-muted-foreground"}`}>{m.name} · {new Date(m.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p></div></li>; })}</ol> : <p className="text-sm text-muted-foreground">No messages yet.</p>}
    <form className="mt-4 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!t.trim()) return; setBusy(true); const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, action: "message", text: t }) }); setBusy(false); if (r.ok) { setT(""); router.refresh(); } }}><label className="sr-only" htmlFor="thread-text">Message</label><textarea id="thread-text" rows={1} value={t} onChange={(e) => setT(e.target.value)} placeholder={me === "seller" ? "Message your advisor" : "Message the owner"} className="input min-h-11 flex-1 resize-none" /><button id="thread-send" disabled={busy || !t.trim()} className="btn btn-primary !min-h-11 !px-4" aria-label="Send"><Send size={16} /></button></form>
  </div>;
}
