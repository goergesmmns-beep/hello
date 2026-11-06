"use client";
import { useState } from "react";
import { BellRing, Check } from "lucide-react";

/** Buyer criteria for new-listing emails. Goes to the advisor inbox as a Deal alert. */
export function DealAlerts({ categories }: { categories: string[] }) {
  const [s, setS] = useState<"idle" | "busy" | "done" | "error">("idle"); const [picked, setPicked] = useState<string[]>([]);
  return (
    <section id="alerts" className="dark mesh scroll-mt-20 bg-background text-foreground"><div className="wrap grid gap-10 py-16 md:grid-cols-[1fr_1.1fr] md:py-24">
      <div><span className="grid size-12 place-items-center rounded-xl bg-brand text-brand-foreground"><BellRing size={22} /></span><h2 className="h2 mt-6 max-w-xl">See new deals before they go public.</h2><p className="lede mt-4">Tell us what you buy. When a matching business is prepared for sale, you hear about it first.</p>
        <ul className="mt-6 space-y-2 text-[15px]">{["Matched to your price range and sectors", "Early look before wider marketing", "No spam. One click to stop"].map((t) => <li key={t} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-brand" />{t}</li>)}</ul></div>
      {s === "done" ? <div role="status" className="grid place-items-center rounded-2xl border p-10 text-center"><div><Check size={28} className="mx-auto text-brand" /><p className="mt-3 text-xl font-semibold">You are on the list.</p><p className="mt-1 text-muted-foreground">We will email you when a match comes up.</p></div></div> :
      <form className="space-y-4 rounded-2xl border bg-card/60 p-5 backdrop-blur md:p-7" onSubmit={async (e) => { e.preventDefault(); setS("busy"); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "Deal alert", fields: { name: f.name, email: f.email, budget: f.budget, sectors: picked.join(", ") || "Any", funding: f.funding, company_url: f.company_url } }) }); setS(r.ok ? "done" : "error"); }}>
        <div className="grid gap-3 sm:grid-cols-2"><label className="field" htmlFor="da-name">Name<input id="da-name" name="name" required className="input" autoComplete="name" /></label><label className="field" htmlFor="da-email">Email<input id="da-email" name="email" type="email" required className="input" autoComplete="email" /></label></div>
        <fieldset><legend className="mb-2 text-sm font-medium">Sectors</legend><div className="flex flex-wrap gap-2">{categories.map((c) => { const on = picked.includes(c); return <button key={c} type="button" aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== c) : [...picked, c])} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${on ? "border-brand bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>; })}</div></fieldset>
        <div className="grid gap-3 sm:grid-cols-2"><label className="field" htmlFor="da-budget">Budget<select id="da-budget" name="budget" className="input"><option>Under $250K</option><option>$250K to $1M</option><option>$1M to $5M</option><option>$5M and up</option></select></label><label className="field" htmlFor="da-funding">How you would fund it<select id="da-funding" name="funding" className="input"><option>Own capital</option><option>SBA or bank loan</option><option>Investors or a fund</option><option>Seller financing</option><option>Not sure yet</option></select></label></div>
        <input name="company_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        {s === "error" && <p role="alert" className="text-sm text-destructive">That did not send. Try again.</p>}
        <button id="da-submit" className="btn btn-brand w-full" disabled={s === "busy"}>{s === "busy" ? "Saving…" : "Get deal alerts"}</button>
      </form>}
    </div></section>
  );
}
