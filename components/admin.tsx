"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const [err, setErr] = useState("");
  return <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }) }); if (res.ok) window.location.assign("/admin"); else setErr((await res.json()).error); }}>
    <label className="field" htmlFor="password">Advisor password<input id="password" name="password" type="password" className="input" required /></label>{err && <p role="alert" className="text-sm text-destructive">{err}</p>}<button className="btn btn-primary w-full">Sign in</button></form>;
}
export function Decide({ id, stage }: { id: string; stage: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  const go = async (action: string) => { setBusy(true); await fetch(`/api/admin/buyers/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); setBusy(false); router.refresh(); };
  return <div className="flex flex-wrap gap-2">{stage !== "cim" && stage !== "call" && <button id="release" disabled={busy} className="btn btn-primary" onClick={() => go("release")}>Release CIM</button>}{stage !== "warm" && <button id="warm" disabled={busy} className="btn btn-ghost" onClick={() => go("warm")}>Keep warm</button>}</div>;
}
