"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, FileSignature, Lock, ScrollText, ShieldCheck } from "lucide-react";
import { SignaturePad } from "@/components/signature";

const routes = [["own", "Own capital", "I can show proof of funds"], ["company", "Strategic acquirer", "Adding it to an existing company"], ["letter", "Bank or lender letter", "A letter is ready, or I am outside the U.S."], ["financing", "Acquisition financing", "SBA, seller financing or investors"]] as const;
type Route = (typeof routes)[number][0];

/** The NDA as a document, signed inside the buyer dashboard. Read it, confirm who you are, sign. */
export function NdaSigner({ token, listing, signer, needProfile, defaults, clauses, version, draft }: {
  token: string; listing: string; signer: { name: string; email: string }; needProfile: boolean;
  defaults: { route?: Route; why?: string; linkedin?: string; website?: string }; clauses: string[][]; version: string; draft: boolean;
}) {
  const router = useRouter(); const doc = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState(false); const [name, setName] = useState(signer.name); const [drawn, setDrawn] = useState<string | null>(null);
  const [route, setRoute] = useState<Route | "">(defaults.route ?? ""); const [why, setWhy] = useState(defaults.why ?? "");
  const [agree, setAgree] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  useEffect(() => { const d = doc.current; if (d && d.scrollHeight <= d.clientHeight + 8) setRead(true); }, []);
  const call = async (body: Record<string, unknown>) => { const r = await fetch(`/api/access/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error ?? "That did not go through."); return d; };
  const sign = async () => {
    setErr("");
    if (needProfile && !route) return setErr("Choose how you are buying.");
    if (needProfile && why.trim().length < 10) return setErr("Add a sentence on why this business fits you.");
    if (name.trim().split(/\s+/).length < 2) return setErr("Type your full legal name, first and last.");
    if (drawn === "") return setErr("Draw your signature, or switch to Type.");
    if (!agree) return setErr("Tick the box to agree to the NDA.");
    setBusy(true);
    try {
      if (needProfile) await call({ action: "profile", name: name.trim(), why: why.trim(), route, linkedin: defaults.linkedin || undefined, website: defaults.website || undefined });
      await call({ action: "sign", signedName: name.trim(), agree: true, ...(drawn ? { signature: drawn } : {}) });
      router.refresh();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <section className="panel min-w-0"><div className="panel-head"><ScrollText size={17} className="text-muted-foreground" /><h2 className="flex-1">Non-Disclosure Agreement</h2><span className="num text-xs text-muted-foreground">Version {version}</span></div>
      <div className="well !p-3 md:!p-5">
        {draft && <p className="mb-3 rounded-lg border border-c-orange/50 bg-c-orange/10 px-3 py-2 text-[13px] font-medium">Draft wording for testing. The approved Westbound Road NDA replaces it before launch.</p>}
        <div ref={doc} onScroll={(e) => { const d = e.currentTarget; if (d.scrollTop + d.clientHeight >= d.scrollHeight - 24) setRead(true); }} className="max-h-[560px] overflow-y-auto rounded-lg bg-white text-[#1a1a1a] shadow-[0_1px_0_rgba(0,0,0,.05),0_12px_40px_-12px_rgba(0,0,0,.45)]">
          <article id="nda-document" className="mx-auto max-w-[680px] px-6 py-8 font-serif text-[15px] leading-[1.7] md:px-12 md:py-12">
            <header className="flex items-start justify-between gap-4 border-b border-black/15 pb-5 font-sans"><div><p className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"><span className="flex gap-[2px]"><i className="block h-[3px] w-[8px] rounded-full bg-[#f97316]" /><i className="block h-[3px] w-[8px] rounded-full bg-black" /></span>Westbound Road, LLC</p><p className="mt-1 text-xs text-black/55">Business brokerage · Mergers &amp; acquisitions</p></div><p className="text-right text-xs text-black/55">Confidential<br />{today}</p></header>
            <h1 className="mt-7 text-center font-sans text-[20px] font-semibold uppercase tracking-[.08em]">Non-Disclosure Agreement</h1>
            <p className="mt-6">This Non-Disclosure Agreement is entered into on <b>{today}</b> between <b>Westbound Road, LLC</b>, on behalf of the owner of the business described as <b>&ldquo;{listing}&rdquo;</b> (the &ldquo;Business&rdquo;), and the undersigned prospective buyer (the &ldquo;Recipient&rdquo;).</p>
            <dl className="mt-5 grid grid-cols-[110px_1fr] gap-y-1 rounded-md border border-black/10 bg-black/[.025] p-4 font-sans text-[13.5px]"><dt className="text-black/55">Recipient</dt><dd className="font-medium">{name || signer.name}</dd><dt className="text-black/55">Email</dt><dd>{signer.email}</dd><dt className="text-black/55">Business</dt><dd>{listing}</dd></dl>
            <ol className="mt-7 space-y-5">{clauses.map(([h, t], i) => <li key={h}><p className="font-sans text-[14px] font-semibold">{i + 1}. {h}</p><p className="mt-1 text-black/80">{t}</p></li>)}</ol>
            <p className="mt-7">This Agreement is signed electronically. An electronic signature has the same effect as a handwritten one. A signing certificate recording the time, IP address and a fingerprint of this document is attached to the signed copy.</p>
            <div className="mt-10 grid gap-8 font-sans text-[13px] sm:grid-cols-2">
              <div><div className="flex h-14 items-end border-b border-black/40 pb-1">{drawn ? <img src={drawn} alt="Your drawn signature" className="h-12 object-contain" /> : <span className="font-[cursive] text-[26px] italic leading-none text-black/80">{name}</span>}</div><p className="mt-1.5 font-medium">{name || "Recipient"}</p><p className="text-black/55">Recipient · {today}</p></div>
              <div><div className="flex h-14 items-end border-b border-black/40 pb-1"><span className="text-[13px] text-black/55">Countersigned on the record</span></div><p className="mt-1.5 font-medium">Westbound Road, LLC</p><p className="text-black/55">On behalf of the owner</p></div>
            </div>
          </article>
        </div>
        <p className={`mt-3 flex items-center gap-2 text-[13px] ${read ? "text-c-green" : "text-muted-foreground"}`}>{read ? <><Check size={14} />You have read to the end</> : <><ScrollText size={14} />Scroll to the end of the agreement to sign</>}</p>
      </div>
    </section>

    <aside className="space-y-5 xl:sticky xl:top-[84px] xl:self-start">
      <section className="panel"><div className="panel-head"><FileSignature size={17} className="text-muted-foreground" /><h2>Sign</h2></div><div className="well space-y-5">
        {needProfile && <div className="space-y-3"><p className="text-[13px] font-medium text-muted-foreground">How are you buying?</p><div className="grid gap-1.5" role="radiogroup" aria-label="How are you buying?">{routes.map(([k, t, d]) => <button key={k} id={`route-${k}`} type="button" role="radio" aria-checked={route === k} onClick={() => setRoute(k)} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${route === k ? "border-c-orange bg-c-orange/10" : "bg-surface-1 hover:border-foreground/30"}`}><span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${route === k ? "border-c-orange" : ""}`}>{route === k && <i className="block size-2 rounded-full bg-c-orange" />}</span><span><b className="block text-[13.5px] font-medium">{t}</b><span className="text-xs text-muted-foreground">{d}</span></span></button>)}</div>
          <label className="field" htmlFor="why">Why this business?<textarea id="why" rows={3} value={why} onChange={(e) => setWhy(e.target.value)} className="input" placeholder="Your background and how you would run it." /></label></div>}
        <SignaturePad name={name} onName={setName} onDrawn={setDrawn} />
        <label htmlFor="nda-agree" className="flex cursor-pointer gap-2.5 text-[13.5px] leading-snug"><input id="nda-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--c-orange)]" />I have read this NDA, agree to its terms and agree to sign electronically.</label>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <button id="sign" type="button" onClick={sign} disabled={busy || !read} className="btn btn-brand w-full">{busy ? "Signing…" : read ? "Sign NDA" : "Read to the end to sign"}</button>
      </div></section>
      <section className="panel"><div className="well space-y-2.5 !p-4 text-[13px] text-muted-foreground">
        <p className="flex gap-2"><BadgeCheck size={15} className="mt-0.5 shrink-0 text-c-green" />Signing as {signer.email}, verified by your sign-in</p>
        <p className="flex gap-2"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Time, IP address and a SHA-256 fingerprint are sealed into a signing certificate</p>
        <p className="flex gap-2"><Lock size={15} className="mt-0.5 shrink-0" />A signed PDF lands in Documents and your inbox, with a public verify link</p>
      </div></section>
    </aside>
  </div>;
}
