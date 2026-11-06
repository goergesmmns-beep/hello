"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
/** Starts a deal from the dashboard. The buyer profile fills the request, so it is one click. */
export function RequestButton({ slug, className = "" }: { slug: string; className?: string }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  return <><button id="request-access" disabled={busy} onClick={async () => { setBusy(true); setErr(""); const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "request", slug }) }); const d = await r.json().catch(() => ({})); if (r.ok && d.next) { window.location.assign(d.next); return; } setBusy(false); setErr(d.error ?? "That did not go through. Try again."); }} className={`btn btn-brand w-full ${className}`}>{busy ? "Opening your NDA…" : "Request access"} {!busy && <ArrowRight size={17} />}</button>{err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}</>;
}
