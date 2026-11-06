"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import type { User } from "@/lib/accounts";
import { budgets, Chips, fundings, sectors, Tiles, types } from "./onboard";
const P = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => <section className="panel"><div className="panel-head"><h2>{title}{sub && <span className="ml-2 text-[13px] font-normal text-muted-foreground">· {sub}</span>}</h2></div><div className="well space-y-4">{children}</div></section>;
export function ProfileForm({ u }: { u: User }) {
  const [v, setV] = useState({ name: u.name, phone: u.phone ?? "", company: u.company ?? "", title: u.title ?? "", location: u.location ?? "", linkedin: u.linkedin ?? "", website: u.website ?? "" });
  const [b, setB] = useState({ type: u.buyer?.type, budget: u.buyer?.budget ?? "", sectors: u.buyer?.sectors ?? [], funding: u.buyer?.funding ?? "", experience: u.buyer?.experience ?? "", timeline: u.buyer?.timeline ?? "", about: u.buyer?.about ?? "" });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const F = (k: keyof typeof v, label: string, type = "text", ac?: string) => <label className="field" htmlFor={`pf-${k}`}>{label}<input id={`pf-${k}`} type={type} autoComplete={ac} className="input" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>;
  return <form className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setMsg(""); const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "profile", data: { ...v, buyer: { ...b, budget: b.budget || undefined, funding: b.funding || undefined } } }) }); const d = await r.json().catch(() => ({})); setBusy(false); setMsg(r.ok ? "Saved." : d.error ?? "Not saved."); }}>
    <div className="space-y-3">
      <P title="Buyer profile" sub="Reused on every listing you request">
        <fieldset><legend className="mb-2 text-sm font-medium">Which describes you?</legend><Tiles all={types} on={b.type} set={(t) => setB({ ...b, type: t })} /></fieldset>
        <fieldset><legend id="pf-sec" className="mb-2 text-sm font-medium">Sectors</legend><Chips id="pf-sec" all={sectors} on={b.sectors} set={(s) => setB({ ...b, sectors: s })} /></fieldset>
        <div className="grid gap-4 sm:grid-cols-2"><label className="field" htmlFor="pf-budget">Budget<select id="pf-budget" className="input" value={b.budget} onChange={(e) => setB({ ...b, budget: e.target.value })}><option value="">Choose one</option>{budgets.map((x) => <option key={x}>{x}</option>)}</select></label><label className="field" htmlFor="pf-funding">Funding<select id="pf-funding" className="input" value={b.funding} onChange={(e) => setB({ ...b, funding: e.target.value })}><option value="">Choose one</option>{fundings.map((x) => <option key={x}>{x}</option>)}</select></label><label className="field" htmlFor="pf-exp">Acquisitions completed<select id="pf-exp" className="input" value={b.experience} onChange={(e) => setB({ ...b, experience: e.target.value })}><option value="">Choose one</option>{["None yet", "1", "2 to 5", "More than 5"].map((x) => <option key={x}>{x}</option>)}</select></label><label className="field" htmlFor="pf-time">Timeline to buy<select id="pf-time" className="input" value={b.timeline} onChange={(e) => setB({ ...b, timeline: e.target.value })}><option value="">Choose one</option>{["Ready now", "Within 3 months", "3 to 6 months", "Just looking"].map((x) => <option key={x}>{x}</option>)}</select></label></div>
        <label className="field" htmlFor="pf-about">About you as a buyer<textarea id="pf-about" rows={4} className="input" value={b.about} onChange={(e) => setB({ ...b, about: e.target.value })} placeholder="Your background, what you are looking for and how you would run the business." /></label>
      </P>
    </div>
    <div className="space-y-3 xl:sticky xl:top-20 xl:self-start">
      <P title="Contact">{F("name", "Full name", "text", "name")}<div className="grid gap-4 sm:grid-cols-2">{F("phone", "Phone", "tel", "tel")}{F("location", "Location", "text", "address-level2")}{F("company", "Company", "text", "organization")}{F("title", "Title", "text", "organization-title")}</div>{F("linkedin", "LinkedIn", "url")}{F("website", "Website", "url")}<p className="text-xs text-muted-foreground">Signed in as {u.email}{u.via === "google" ? " with Google" : ""}.</p></P>
      <button id="pf-save" disabled={busy} className="btn btn-brand w-full">{busy ? "Saving…" : "Save profile"}</button>{msg && <p role="status" className="flex items-center gap-1.5 text-sm">{msg === "Saved." && <Check size={15} className="text-c-green" />}{msg}</p>}
    </div>
  </form>;
}
