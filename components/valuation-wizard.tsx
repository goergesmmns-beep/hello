"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";

const types = ["SaaS or software", "eCommerce or DTC", "Agency or services", "eLearning", "Subscription or membership", "Publishing or media", "Other"];
const revenue = ["Under $1M", "$1M to $5M", "$5M to $10M", "$10M to $20M", "$20M or more"];
const profit = ["Not yet profitable", "Under $250K", "$250K to $1M", "$1M to $3M", "$3M or more"];
const timeline = ["Within 90 days", "3 to 6 months", "6 to 12 months", "A year or more", "Just exploring"];
const steps = ["Business", "Size", "Timing", "Contact"];

/** Four short steps on any device. Sent to advisors as a Valuation request. */
export function ValuationWizard() {
  const [i, setI] = useState(0); const [v, setV] = useState<Record<string, string>>({}); const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const pick = (k: string, x: string, next = true) => { setV((o) => ({ ...o, [k]: x })); if (next) setTimeout(() => setI((n) => Math.min(n + 1, 3)), 160); };
  const Tiles = ({ k, opts, next = true }: { k: string; opts: string[]; next?: boolean }) => <div className="grid gap-2 sm:grid-cols-2">{opts.map((o) => <button key={o} type="button" aria-pressed={v[k] === o} onClick={() => pick(k, o, next)} className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left font-medium transition-colors ${v[k] === o ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40"}`}>{o}{v[k] === o && <Check size={17} />}</button>)}</div>;
  if (state === "done") return <div role="status" className="gborder grid min-h-[420px] place-items-center rounded-3xl p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-brand text-brand-foreground"><Check size={26} /></span><h3 className="mt-5 text-2xl font-semibold">Your valuation request is in.</h3><p className="mx-auto mt-2 max-w-sm text-muted-foreground">A Certified M&A Advisor will review it and contact you to talk through value, timing and structure.</p></div></div>;
  return (
    <div className="gborder rounded-3xl p-5 md:p-8">
      <div className="mb-7"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Step {i + 1} of 4 · {steps[i]}</span><span className="flex items-center gap-1.5 text-muted-foreground"><Lock size={13} /> Confidential</span></div><div className="grid grid-cols-4 gap-1.5">{steps.map((s, n) => <span key={s} className={`h-1 rounded-full transition-colors ${n <= i ? "bg-brand" : "bg-border"}`} />)}</div></div>
      {i === 0 && <fieldset><legend className="mb-4 text-2xl font-semibold tracking-tight">What kind of business is it?</legend><Tiles k="industry" opts={types} /></fieldset>}
      {i === 1 && <div className="space-y-6"><fieldset><legend className="mb-3 text-2xl font-semibold tracking-tight">Annual revenue</legend><Tiles k="revenue" opts={revenue} next={false} /></fieldset><fieldset><legend className="mb-3 text-lg font-semibold">Annual profit (SDE or EBITDA)</legend><Tiles k="profit" opts={profit} next={!!v.revenue} /></fieldset></div>}
      {i === 2 && <div className="space-y-6"><fieldset><legend className="mb-3 text-2xl font-semibold tracking-tight">When would you like to sell?</legend><Tiles k="timeline" opts={timeline} next={false} /></fieldset><label className="field" htmlFor="vw-why">Anything we should know? Optional<textarea id="vw-why" rows={3} className="input" value={v.details ?? ""} onChange={(e) => setV({ ...v, details: e.target.value })} placeholder="Why you are selling, what you want after the sale, any partners involved." /></label></div>}
      {i === 3 && <form id="vw-form" className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); setState("busy"); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "Valuation request", fields: { ...v, ...f } }) }); setState(r.ok ? "done" : "error"); }}>
        <h3 className="text-2xl font-semibold tracking-tight sm:col-span-2">Where should we send it?</h3>
        {[["name", "Name", "text", "name"], ["email", "Email", "email", "email"], ["phone", "Phone", "tel", "tel"], ["company", "Company name", "text", "organization"]].map(([n, l, t, a]) => <label key={n} className="field" htmlFor={`vw-${n}`}>{l}<input id={`vw-${n}`} name={n} type={t} required autoComplete={a} className="input" /></label>)}
        <label className="field sm:col-span-2" htmlFor="vw-url">Business website<input id="vw-url" name="url" className="input" placeholder="example.com" /></label>
        <input name="company_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        {state === "error" && <p role="alert" className="text-sm text-destructive sm:col-span-2">That did not send. Try again.</p>}
      </form>}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="btn btn-ghost !min-h-11 disabled:invisible"><ArrowLeft size={16} /> Back</button>
        {i < 3 ? <button id="vw-next" type="button" disabled={(i === 0 && !v.industry) || (i === 1 && !(v.revenue && v.profit)) || (i === 2 && !v.timeline)} onClick={() => setI(i + 1)} className="btn btn-primary !min-h-11">Continue <ArrowRight size={16} /></button>
          : <button id="vw-submit" form="vw-form" disabled={state === "busy"} className="btn btn-brand !min-h-11">{state === "busy" ? "Sending…" : "Get my free valuation"}</button>}
      </div>
    </div>
  );
}
