"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, FileText, Lock } from "lucide-react";
import { money } from "@/content/listings";
import { FundsForm } from "./funds-form";
import { SignaturePad } from "./signature";

type Pub = { name: string; email: string; linkedin?: string; website?: string; why?: string; route?: string; stage: string; ndaSigned: boolean; ndaSignedAt?: string; funds?: { status?: string; note?: string; docs: string[] } };
type L = { title: string; askLabel: string; floor: number | null; idealBuyer: string; gate: string };
const routes = [
  ["own", "Individual buyer, own capital", "I can show proof of funds"],
  ["company", "Strategic acquirer", "We would add this to our existing business"],
  ["letter", "Bank or lender letter", "I have a letter ready, or I am outside the U.S."],
  ["financing", "Using acquisition financing", "SBA, seller financing or outside investors"],
] as const;
const steps = ["Profile", "NDA", "Funding", "CIM"];

export function AccessFlow({ token, code, buyer, listing, clauses, ndaDraft, localLink, bookingUrl }: { bookingUrl?: string; token: string; code?: string; buyer: Pub; listing: L; clauses: string[][]; ndaDraft: boolean; localLink?: string }) {
  const [b, setB] = useState(buyer);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sigName, setSigName] = useState(buyer.name); const [drawn, setDrawn] = useState<string | null>(null);
  const [route, setRoute] = useState(buyer.route ?? (listing.idealBuyer === "strategic" ? "company" : ""));
  const send = async (body: BodyInit, json = true) => {
    setBusy(true); setErr("");
    const res = await fetch(`/api/access/${token}`, { method: "POST", body, headers: json ? { "Content-Type": "application/json" } : undefined });
    const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
    setBusy(false);
    if (!res.ok) setErr(data.error); else { setB(data); window.scrollTo(0, 0); }
  };
  const step = !b.why ? 0 : !b.ndaSigned ? 1 : b.stage === "capacity" ? 2 : 3;
  const pre = { name: b.name };
  const Err = err ? <p role="alert" className="text-sm text-destructive">{err}</p> : null;

  return (
    <div className="space-y-6">
      <div><p className="eyebrow mb-1.5">{listing.title}</p>
        <ol className="grid grid-cols-4 gap-1.5" aria-label="Progress">{steps.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined}><span className={`block h-1 rounded-full ${i <= step ? "bg-brand" : "bg-border"}`} /><span className={`mt-1.5 block text-xs ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{s}</span></li>)}</ol></div>

      {step === 0 && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)); if (!route) { setErr("Choose how you are buying."); return; } send(JSON.stringify({ action: "profile", ...f, route })); }}>
        <h1 className="text-3xl font-semibold">How are you buying?</h1>
        {listing.idealBuyer === "strategic" && <p className="text-muted-foreground">This business is best suited to a strategic acquirer.</p>}
        <div className="grid gap-2" role="group" aria-label="How are you buying?">{routes.map(([k, t, d]) => <button type="button" id={`route-${k}`} key={k} aria-pressed={route === k} onClick={() => setRoute(k)} className={`rounded-md border p-3.5 text-left transition-colors ${route === k ? "border-foreground bg-foreground text-background" : "hover:border-foreground"}`}><span className="block font-semibold">{t}</span><span className="block text-sm opacity-70">{d}</span></button>)}</div>
        <label className="field" htmlFor="name">Full name<input id="name" name="name" className="input" required defaultValue={pre.name} /></label>
        <label className="field" htmlFor="linkedin">LinkedIn<input id="linkedin" name="linkedin" className="input" placeholder="linkedin.com/in/you" /></label>
        <label className="field" htmlFor="website">Website or company<input id="website" name="website" className="input" /></label>
        <label className="field" htmlFor="why">Why this business?<textarea id="why" name="why" className="input" rows={4} required minLength={10} /></label>
        {Err}<button className="btn btn-primary w-full" disabled={busy}>Continue to NDA <ArrowRight size={17} /></button>
      </form>}

      {step === 1 && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (drawn === "") { setErr("Draw your signature, or switch to Type."); return; } const f = new FormData(e.currentTarget); send(JSON.stringify({ action: "sign", signedName: sigName, agree: true, ...(drawn ? { signature: drawn } : {}) })); }}>
        <h1 className="text-3xl font-semibold">Sign the NDA</h1>
        {ndaDraft && <p className="rounded-md border border-brand bg-brand/15 p-3 text-sm font-medium">Draft wording for testing. Westbound Road's approved NDA replaces this before launch.</p>}
        <div className="max-h-80 space-y-3 overflow-auto rounded-md border p-4 text-[15px]">{clauses.map(([h, t]) => <div key={h}><p className="font-semibold">{h}</p><p className="text-muted-foreground">{t}</p></div>)}</div>
        <SignaturePad name={sigName} onName={setSigName} onDrawn={setDrawn} />
        <p className="text-sm text-muted-foreground">By tapping Agree and sign, you agree to this NDA and to signing electronically. You get a signed copy right after.</p>
        {Err}<div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:p-0"><button id="sign" className="btn btn-primary w-full" disabled={busy}>{busy ? "Signing…" : "Agree and sign"}</button></div>
      </form>}

      {step === 2 && (b.route === "own" || b.route === "letter") && <FundsForm token={token} floor={listing.floor} note={b.funds?.note} existing={b.funds?.docs ?? []} onDone={(x) => setB(x)} />}

      {step === 2 && b.route !== "own" && b.route !== "letter" && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget), false); }}>
        {b.route === "company" ? <><h1 className="text-3xl font-semibold">Tell us about the company</h1><p className="text-muted-foreground">Company buyers skip the personal funds step.</p>
          <label className="field" htmlFor="role">Your role<input id="role" name="role" className="input" required /></label>
          <label className="field" htmlFor="acquisitions">Past acquisitions<input id="acquisitions" name="acquisitions" className="input" /></label>
          <label className="field" htmlFor="competitor">Are you a competitor of this kind of business?<select id="competitor" name="competitor" className="input" required defaultValue=""><option value="" disabled>Choose one</option><option>No</option><option>Adjacent, not direct</option><option>Direct competitor</option></select></label></>
        : b.route === "financing" ? <><h1 className="text-3xl font-semibold">How would you fund this?</h1><p className="text-muted-foreground">Many deals use financing. Tell us your plan and an advisor will take it from there.</p>
          <label className="field" htmlFor="plan">Funding plan<select id="plan" name="plan" className="input" required defaultValue=""><option value="" disabled>Choose one</option><option>SBA loan</option><option>Seller financing</option><option>Outside investors</option><option>Not sure yet</option></select></label>
          <label className="field" htmlFor="notes">Anything else?<textarea id="notes" name="notes" className="input" rows={3} /></label></>
        : null}
        {Err}<button className="btn btn-primary w-full" disabled={busy}>Send to an advisor</button>
      </form>}

      {b.stage === "review" && <div className="space-y-3"><h1 className="text-3xl font-semibold">An advisor has this.</h1><Done>NDA signed</Done>{b.funds?.docs.length ? <Done>Proof of funds received: {b.funds.docs.length} {b.funds.docs.length === 1 ? "document" : "documents"}</Done> : null}<p className="text-muted-foreground">We will email you as soon as your CIM is ready.</p></div>}

      {(b.stage === "cim" || b.stage === "call") && <div className="space-y-4"><h1 className="text-3xl font-semibold">{code ? "Your CIM is open." : "Your CIM is ready."}</h1>
        {code ? <><Link id="enter-room" href={`/room/${token}?v=${code}`} className="btn btn-brand w-full">Enter the deal room <ArrowRight size={18} /></Link><a href={`/api/cim/${token}?v=${code}`} target="_blank" rel="noreferrer" className="btn btn-ghost w-full"><FileText size={18} /> Download the CIM</a><p className="text-sm text-muted-foreground">Financials, documents, Q&amp;A and next steps in one place. Your email appears on every page.</p>
          {b.stage === "cim" ? (bookingUrl ? <a id="book" href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-ghost w-full" onClick={() => send(JSON.stringify({ action: "call", note: "Opened the booking link" }))}>Book a call with an advisor</a> : <button className="btn btn-ghost w-full" disabled={busy} onClick={() => send(JSON.stringify({ action: "call" }))}>Request a call with an advisor</button>) : <Done>{bookingUrl ? "Your booking link opened in a new tab" : "An advisor will contact you about a call"}</Done>}</>
        : <><p className="flex gap-2 text-muted-foreground"><Lock size={18} className="mt-1 shrink-0" />We sent a private link to {b.email}. Open it to confirm your email and view the CIM.</p>{localLink && <Link className="btn btn-ghost w-full" href={localLink} id="local-link">Test mode: open the emailed link</Link>}</>}
      </div>}

      {b.stage === "warm" && <div className="space-y-4"><h1 className="text-3xl font-semibold">Your next step is the funding plan.</h1><Done>NDA signed. You stay on this listing's buyer list.</Done>
        {bookingUrl ? <a className="btn btn-primary w-full" href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => send(JSON.stringify({ action: "call", note: "Opened the booking link" }))}>Book a strategy session</a> : <button className="btn btn-primary w-full" disabled={busy} onClick={() => send(JSON.stringify({ action: "call", note: "Asked for a strategy session" }))}>Request a strategy session</button>}
        <Link className="btn btn-ghost w-full" href="/acquisitions-alliance">Join Acquisitions Alliance</Link><Link className="btn btn-ghost w-full" href="/buy">See other listings</Link></div>}
      {b.ndaSigned && <a className="block text-sm underline" href={`/api/access/${token}/nda`} target="_blank" rel="noreferrer">Download your signed NDA</a>}
    </div>
  );
}
function Done({ children }: { children: React.ReactNode }) { return <p className="flex gap-2 rounded-md border p-3"><Check size={19} className="mt-0.5 shrink-0 text-brand-ink" />{children}</p>; }
