"use client";
import { useState } from "react";
export function Newsletter() {
  const [s, setS] = useState<"idle" | "busy" | "done" | "error">("idle");
  return (
    <section className="dark border-b bg-background text-foreground"><div className="wrap grid gap-8 py-16 md:grid-cols-2 md:items-end">
      <div><p className="eyebrow mb-3 !text-brand">Acquisition newsletter</p><h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-tight">Find out about the hottest deals before anyone else.</h2></div>
      {s === "done" ? <p role="status" className="text-lg font-medium">You are on the list.</p> :
      <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); setS("busy"); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "Newsletter", fields: { name: f.name, email: f.email } }) }); setS(r.ok ? "done" : "error"); }}>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input aria-label="Name" id="nl-name" name="name" required placeholder="Name" className="input" /><input aria-label="Email" id="nl-email" name="email" type="email" required placeholder="Email" className="input" /><button className="btn btn-brand" disabled={s === "busy"}>Subscribe</button></div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground" htmlFor="nl-ok"><input id="nl-ok" type="checkbox" required className="mt-0.5 size-4" />I agree to receive marketing and promotional materials.</label>
        {s === "error" && <p role="alert" className="text-sm text-destructive">That did not send. Try again.</p>}
      </form>}
    </div></section>
  );
}
