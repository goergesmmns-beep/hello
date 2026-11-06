import Link from "next/link";
import { ArrowRight, BadgeCheck, Calculator, Check, Eye, FileSignature, FolderOpen, Handshake, MessagesSquare, ShieldCheck, Store, Users } from "lucide-react";
import { Card, Empty } from "@/components/desk/panel";
import { Funnel, Stepper, ViewBars } from "@/components/portal/seller-bits";
import { money } from "@/content/listings";
import { me } from "@/lib/my";
import { checks, missing, subLabels } from "@/lib/seller";
import { alias, sellerCtx, subTitle } from "@/lib/seller-portal";
export const metadata = { title: "Overview" };
const ago = (s: string) => { const m = (Date.now() - new Date(s).getTime()) / 6e4; return m < 60 ? `${Math.max(1, Math.round(m))}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };
const told: Record<string, string> = { inquiry: "requested access", nda: "signed the NDA", funds_ok: "had their funds verified", cim: "was given the deal room", cim_view: "opened the deal room", question: "asked a question", call: "asked for a call", offer: "made an offer" };

export default async function SellerHome() {
  const u = await me("/seller"); const c = await sellerCtx(u); const s = c.cur;
  if (!s) return <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
    <section className="panel"><div className="well grid-lines relative overflow-hidden p-7 md:p-10"><p className="text-sm font-medium uppercase tracking-[.12em] text-c-orange">Seller dashboard</p><h1 className="mt-3 max-w-xl text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.06] tracking-tight">Sell your business, privately.</h1><p className="mt-3 max-w-lg text-[16.5px] text-muted-foreground">A guided listing takes about 15 minutes. An advisor verifies the numbers with you, buyers sign an NDA and prove their funds, and you watch every step from here.</p><div className="mt-7 flex flex-wrap gap-2"><a id="start-listing" href="/seller/new" className="btn btn-brand">Start your listing <ArrowRight size={17} /></a><Link href="/seller/valuation" className="btn btn-ghost"><Calculator size={16} />Free valuation first</Link></div></div></section>
    <Card title="How it works" icon={Store}><ol className="space-y-4">{[["List privately", "Your business name is never shown publicly."], ["Advisor verifies", "We check ownership and numbers with you on a call."], ["Vetted buyers only", "Every buyer signs an NDA and proves funds before the deal room."], ["Offers, side by side", "Compare price, cash at close and terms right here."]].map(([h, d], i) => <li key={h} className="flex gap-3"><span className="num grid size-7 shrink-0 place-items-center rounded-full border bg-surface-1 text-xs">{i + 1}</span><span><b className="block font-medium">{h}</b><span className="text-sm text-muted-foreground">{d}</span></span></li>)}</ol></Card>
  </div>;

  const flow = ["Draft", "Submitted", "In review", "Approved", "Live"]; const at = c.live ? 4 : ({ draft: 0, changes: 0, submitted: 1, review: 2, approved: 3, rejected: 2 } as Record<string, number>)[s.status];
  const steps = flow.map((k, i) => [k, i < at || (c.live && i === 4) ? "done" : i === at ? "now" : "todo"] as [string, "done" | "now" | "todo"]);
  const head = <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="min-w-0"><p className="text-sm text-muted-foreground">{c.live ? "Live on the marketplace" : subLabels[s.status]}{s.submittedAt && ` · submitted ${s.submittedAt.slice(0, 10)}`}</p><h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">{subTitle(s)}</h1></div><div className="flex flex-wrap gap-2">{c.live && <Link href={`/buy/${c.listing!.slug}`} target="_blank" className="tbtn"><Eye size={15} />Public listing</Link>}<Link href="/seller/listing" className="btn btn-brand !min-h-10 !rounded-[10px] !text-[14px]">{s.status === "draft" || s.status === "changes" ? "Continue listing" : "Listing details"} <ArrowRight size={16} /></Link></div></div>;
  const msgs = <Card title="Your advisor" icon={MessagesSquare} action={<Link href="/seller/messages" className="tbtn !h-8 !px-2.5 !text-[13px]">Open</Link>}>{s.messages.length ? <ul className="space-y-3">{s.messages.slice(-3).map((m) => <li key={m.id} className="text-sm"><p className="flex justify-between gap-2 text-xs text-muted-foreground"><span>{m.from === "seller" ? "You" : m.name}</span><span>{ago(m.at)}</span></p><p className="mt-0.5 line-clamp-2">{m.text}</p></li>)}</ul> : <p className="text-sm text-muted-foreground">Questions about the process, the price or a buyer? Message your advisor any time.</p>}</Card>;

  if (!c.live) {
    const miss = missing(s); const note = [...s.history].reverse().find((h) => h.status === s.status)?.note; const done = checks.filter(([k]) => s.checklist[k]).length;
    const next = s.status === "draft" ? <><p className="text-muted-foreground">{miss.length ? "Finish these and submit. Your draft saves as you go." : "Everything is in. Review and submit when you are ready."}</p>{miss.length > 0 && <ul className="mt-4 space-y-2">{miss.map((m) => <li key={m} className="flex items-center gap-2.5 text-sm"><span className="size-4 rounded-full border" />{m}</li>)}</ul>}<Link href="/seller/listing" className="btn btn-primary mt-5 !min-h-10">Continue listing <ArrowRight size={16} /></Link></>
      : s.status === "changes" ? <><p className="rounded-xl border border-c-orange/40 bg-c-orange/10 p-4 text-sm">{note ?? "Your advisor asked for a few changes."}</p><Link href="/seller/listing" className="btn btn-primary mt-5 !min-h-10">Make the changes <ArrowRight size={16} /></Link></>
      : s.status === "rejected" ? <p className="text-muted-foreground">{note ?? "This business is not a fit for our process right now."} You can reply to your advisor in Messages.</p>
      : s.status === "approved" ? <p className="text-muted-foreground">Approved. Your advisor is preparing the listing and the deal room. You will get an email the moment it goes live.</p>
      : <p className="text-muted-foreground">Your advisor is reviewing the business and will set up a short call to confirm ownership and the numbers. Most reviews finish within two business days.</p>;
    return <>{head}
      <section className="panel mb-5"><div className="well"><Stepper steps={steps} /></div></section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5"><Card title="What happens next">{next}</Card>
          <section className="panel"><div className="panel-head"><Eye size={17} className="text-muted-foreground" /><h2 className="flex-1">Insights</h2><span className="text-xs text-muted-foreground">Unlock when you go live</span></div><div className="well"><div className="grid grid-cols-2 gap-3 opacity-50 sm:grid-cols-4">{["Views", "Inquiries", "NDAs signed", "Offers"].map((k) => <div key={k} className="rounded-xl border border-dashed p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="num mt-1 text-2xl font-semibold">0</p></div>)}</div><p className="mt-4 text-sm text-muted-foreground">Once live you see views, NDAs, verified buyers and offers as they happen. Buyer names stay private until an advisor introduces you.</p></div></section>
        </div>
        <div className="space-y-5"><Card title="Verification" icon={ShieldCheck} sub={`${done} of ${checks.length}`}><ul className="space-y-2.5">{checks.map(([k, label]) => <li key={k} className="flex items-center gap-2.5 text-sm"><span className={`grid size-5 place-items-center rounded-full border ${s.checklist[k] ? "border-c-green bg-c-green text-black" : ""}`}>{s.checklist[k] && <Check size={12} />}</span><span className={s.checklist[k] ? "" : "text-muted-foreground"}>{label}</span></li>)}</ul></Card>{msgs}</div>
      </div></>;
  }

  const b = c.buyers; const v = c.views!;
  const ndas = b.filter((x) => x.nda).length, verified = b.filter((x) => x.funds?.status === "verified").length, rooms = b.filter((x) => x.cimViews > 0 || x.stage === "cim" || x.stage === "call").length;
  const feed = b.flatMap((x) => x.events.filter((e) => told[e.type]).map((e) => ({ at: e.at, who: alias(x), what: told[e.type] }))).sort((a, z) => z.at.localeCompare(a.at)).slice(0, 8);
  const best = c.offers.filter((o) => o.status !== "Withdrawn" && o.status !== "Declined").sort((a, z) => z.amountUsd - a.amountUsd)[0];
  const tile = (I: typeof Eye, k: string, n: string | number, sub: string, href?: string) => { const body = <div className="well !p-4"><p className="flex items-center gap-2 text-[13px] text-muted-foreground"><I size={15} />{k}</p><p className="num mt-2 text-[28px] font-semibold leading-none">{n}</p><p className="mt-2 text-xs text-muted-foreground">{sub}</p></div>; return href ? <Link href={href} className="panel transition-transform hover:-translate-y-0.5">{body}</Link> : <div className="panel">{body}</div>; };
  return <>{head}
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
      {tile(Eye, "Views", v.last30, `${v.last7} this week · ${v.total} all time`)}
      {tile(Users, "Interested buyers", b.length, "Requested access", "/seller/buyers")}
      {tile(FileSignature, "NDAs signed", ndas, b.length ? `${Math.round((ndas / b.length) * 100)}% of requests` : "None yet", "/seller/buyers")}
      {tile(BadgeCheck, "Funds verified", verified, "Checked by an advisor", "/seller/buyers")}
      {tile(Handshake, "Offers", c.offers.length, best ? `Best ${money(best.amountUsd)}` : "None yet", "/seller/offers")}
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card title="Listing views" icon={Eye} sub="Last 30 days"><ViewBars series={v.series} /></Card>
      <Card title="Buyer funnel"><Funnel rows={[["Requested access", b.length], ["Signed the NDA", ndas], ["Funds verified", verified], ["Opened the deal room", rooms], ["Made an offer", b.filter((x) => (x.offers ?? []).length).length]]} /></Card>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card title="Recent activity" icon={FolderOpen}>{feed.length ? <ol className="-my-1 divide-y">{feed.map((f, i) => <li key={i} className="flex items-center gap-3 py-2.5 text-sm"><span className="grad-av grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold">{f.who.slice(-4, -2)}</span><span className="min-w-0 flex-1"><b className="font-medium">{f.who}</b> {f.what}</span><span className="shrink-0 text-xs text-muted-foreground">{ago(f.at)}</span></li>)}</ol> : <Empty title="No buyer activity yet" text="As buyers request access and sign NDAs, it shows up here. Names stay private." />}</Card>
      {msgs}
    </div></>;
}
