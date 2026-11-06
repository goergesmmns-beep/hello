import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownToLine, CalendarDays, Check, FileText, Lock, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/chrome";
import { AskForm, DocIndex, InterestForm, RoomNav, RoomTracker } from "@/components/room";
import { money } from "@/content/listings";
import { findListing } from "@/lib/catalog";
import { recordCimView, roomBuyer, roomDocs } from "@/lib/flow";
import { getFollowups } from "@/lib/reminders";

export const metadata: Metadata = { title: "Deal room", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const short = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "")}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${n}`);
const statusText: Record<string, string> = { available: "Available", offers: "Accepting offers", pending: "Sale pending" };

function Bars({ rows }: { rows: { period: string; revenue: number; sde: number }[] }) {
  const max = Math.max(...rows.map((r) => r.revenue), 1); const w = 100 / rows.length;
  return <figure><svg viewBox="0 0 100 52" className="h-56 w-full overflow-visible" role="img" aria-label={`Revenue and earnings by period: ${rows.map((r) => `${r.period} revenue ${money(r.revenue)}, earnings ${money(r.sde)}`).join("; ")}`}>
    {[0, .5, 1].map((t) => <line key={t} x1="0" x2="100" y1={46 - t * 42} y2={46 - t * 42} stroke="currentColor" strokeOpacity=".1" strokeWidth=".2" />)}
    {rows.map((r, i) => { const x = i * w + w * .18, bw = w * .3, h1 = (r.revenue / max) * 42, h2 = (Math.max(r.sde, 0) / max) * 42; return <g key={r.period}><rect x={x} y={46 - h1} width={bw} height={h1} rx=".6" className="fill-foreground" /><rect x={x + bw + w * .04} y={46 - h2} width={bw} height={h2} rx=".6" className="fill-brand" /><text x={x + bw + w * .02} y="51" textAnchor="middle" fontSize="2.6" className="fill-muted-foreground">{r.period}</text></g>; })}
  </svg><figcaption className="mt-2 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="block size-2.5 rounded-sm bg-foreground" />Revenue</span><span className="flex items-center gap-1.5"><i className="block size-2.5 rounded-sm bg-brand" />SDE / net income</span></figcaption></figure>;
}
function Section({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return <section id={id} data-room={id} className="scroll-mt-28 border-t py-10 first:border-0 first:pt-0 lg:scroll-mt-8"><p className="num mb-2 text-xs text-brand-ink">{n}</p><h2 className="mb-5 text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h2>{children}</section>;
}
const Tile = ({ k, v, sub }: { k: string; v: string; sub?: string }) => <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">{k}</p><p className="num mt-1.5 text-2xl font-medium">{v}</p>{sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}</div>;

export default async function DealRoom({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ v?: string }> }) {
  const { token } = await params; const { v } = await searchParams;
  const b = await roomBuyer(token, v);
  if (!b) redirect(`/access/${token}`);
  const l = (await findListing(b.listingSlug))!;
  const [docs, { bookingUrl }] = await Promise.all([roomDocs(l.slug), getFollowups()]);
  await recordCimView(b, "Deal room opened");
  const r = l.room ?? {}; const fin = r.financials ?? []; const last = fin[fin.length - 1];
  const first = fin[0]; const growth = fin.length > 1 && first.revenue > 0 ? (last.revenue / first.revenue - 1) * 100 : null;
  const doc = (id: string) => `/api/room/${token}/doc/${id}?v=${encodeURIComponent(v!)}`;
  const story = [["Why the owner is selling", r.reason], ["Team and operations", r.team], ["Transition support", r.transition]].filter((x): x is [string, string] => !!x[1]);
  const nav: [string, string][] = [["overview", "Overview"], ...(fin.length ? [["financials", "Financials"] as [string, string]] : []), ["business", "The business"], ["terms", "Deal terms"], ["documents", "Documents"], ["questions", "Q&A"], ["next", "Next steps"]];
  const num = (i: number) => String(i + 1).padStart(2, "0"); const at = (id: string) => num(nav.findIndex(([k]) => k === id));
  const mark = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='260'><text x='20' y='150' transform='rotate(-24 210 130)' font-family='Arial' font-size='14' fill='rgba(120,120,120,0.10)'>${b.email.replace(/[<>&'"]/g, "")} · Confidential</text></svg>`)}")`;
  return (
    <div className="min-h-dvh bg-background">
      <RoomTracker token={token} v={v!} />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] select-none" style={{ backgroundImage: mark }} />
      <header className="dark bg-background text-foreground">
        <div className="wrap flex h-14 items-center justify-between border-b border-white/10"><Wordmark /><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock size={13} /> Private deal room</span></div>
        <div className="wrap relative overflow-hidden py-10 md:py-14">
          <div aria-hidden className="aurora absolute inset-0 opacity-60" />
          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-brand px-2.5 py-1 font-semibold text-brand-foreground">{statusText[l.status] ?? l.status}</span><span className="rounded-full border border-white/15 px-2.5 py-1 text-muted-foreground">{l.category}</span><span className="rounded-full border border-white/15 px-2.5 py-1 text-muted-foreground">NDA on file · {b.nda?.signedAt.slice(0, 10)}</span></div>
            <h1 className="max-w-3xl text-[34px] font-semibold leading-[1.05] tracking-tight md:text-[52px]">{l.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{l.headline}</p>
            <div className="mt-7 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-4">{[["Asking", l.askLabel], ...l.metrics.slice(0, 3).map((m) => [m.label, m.value])].map(([k, x]) => <div key={k} className="bg-background/80 p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="num mt-1 text-lg font-medium md:text-xl">{x}</p></div>)}</div>
            <div className="mt-7 flex flex-wrap gap-2"><a id="room-cim" href={doc("cim")} target="_blank" rel="noreferrer" className="btn btn-brand"><ArrowDownToLine size={17} /> Open the CIM</a><a href="#next" className="btn btn-ghost">Next steps</a></div>
          </div>
        </div>
      </header>
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur lg:hidden"><div className="wrap py-2"><RoomNav items={nav} /></div></div>
      <div className="wrap grid gap-10 py-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:py-14">
        <aside className="hidden lg:block"><div className="sticky top-8 space-y-6"><RoomNav items={nav} /><p className="flex gap-2 border-t pt-4 text-xs text-muted-foreground"><ShieldCheck size={15} className="shrink-0 text-brand-ink" />Prepared for {b.email}. Every page and download carries your email.</p></div></aside>
        <main className="min-w-0 max-w-3xl">
          <Section id="overview" n={at("overview")} title="Executive summary">
            <p className="text-lg leading-relaxed">{l.summary}</p>
            {l.highlights.length > 0 && <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">{l.highlights.map((h) => <li key={h} className="flex gap-2.5 rounded-lg border p-3.5"><Check size={18} className="mt-0.5 shrink-0 text-brand-ink" />{h}</li>)}</ul>}
          </Section>
          {fin.length > 0 && <Section id="financials" n={at("financials")} title="Financial performance">
            <div className="grid gap-3 sm:grid-cols-3"><Tile k={`Revenue, ${last.period}`} v={short(last.revenue)} sub={growth !== null ? `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}% since ${first.period}` : undefined} /><Tile k={`SDE, ${last.period}`} v={short(last.sde)} /><Tile k="Margin" v={last.revenue ? `${((last.sde / last.revenue) * 100).toFixed(1)}%` : "n/a"} /></div>
            {fin.length > 1 && <div className="mt-6 rounded-xl border p-5"><Bars rows={fin} /></div>}
            <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[420px] text-sm"><thead className="text-left text-muted-foreground"><tr><th className="pb-2 font-medium">Period</th><th className="pb-2 text-right font-medium">Revenue</th><th className="pb-2 text-right font-medium">SDE</th><th className="pb-2 text-right font-medium">Margin</th></tr></thead><tbody>{fin.map((x) => <tr key={x.period} className="border-t"><td className="py-2.5">{x.period}</td><td className="num py-2.5 text-right">{money(x.revenue)}</td><td className="num py-2.5 text-right">{money(x.sde)}</td><td className="num py-2.5 text-right">{x.revenue ? `${((x.sde / x.revenue) * 100).toFixed(1)}%` : ""}</td></tr>)}</tbody></table></div>
            <p className="mt-3 text-xs text-muted-foreground">Figures are seller-provided and unaudited. Full statements are in the documents section and the CIM.</p>
          </Section>}
          <Section id="business" n={at("business")} title="The business">
            <div className="space-y-6">{l.body.map((x, i) => <div key={i}>{x.heading && <h3 className="mb-1.5 text-lg font-semibold">{x.heading}</h3>}<p className="leading-relaxed text-muted-foreground">{x.text}</p></div>)}
              {story.map(([h, t]) => <div key={h}><h3 className="mb-1.5 text-lg font-semibold">{h}</h3><p className="whitespace-pre-line leading-relaxed text-muted-foreground">{t}</p></div>)}</div>
          </Section>
          <Section id="terms" n={at("terms")} title="Deal terms">
            <div className="grid gap-3 sm:grid-cols-3"><Tile k="Asking price" v={l.askUsd ? short(l.askUsd) : l.askLabel} sub={l.askUsd ? l.askLabel : undefined} />{l.askUsd && last?.sde ? <Tile k="SDE multiple" v={`${(l.askUsd / last.sde).toFixed(2)}x`} sub={`On ${last.period} SDE`} /> : null}{l.askUsd && last?.revenue ? <Tile k="Revenue multiple" v={`${(l.askUsd / last.revenue).toFixed(2)}x`} sub={`On ${last.period} revenue`} /> : null}</div>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">{r.structure ?? "Structure is open to discussion. Westbound Road works with buyers on cash, SBA, seller financing and earnout combinations, and can introduce lenders."}</p>
          </Section>
          <Section id="documents" n={at("documents")} title="Documents">
            <DocIndex docs={[{ id: "cim", name: "Confidential Information Memorandum", folder: "Overview" }, ...docs].map((d) => ({ id: d.id, name: d.name, folder: d.folder, href: doc(d.id), viewed: !!b.room?.docs[d.id === "cim" ? "CIM" : d.name] }))} />
          </Section>
          <Section id="questions" n={at("questions")} title="Questions and answers">
            {(r.faq ?? []).length > 0 && <div className="mb-6 divide-y rounded-xl border">{r.faq!.map((f) => <details key={f.q} className="group p-4"><summary className="cursor-pointer list-none font-medium marker:hidden">{f.q}</summary><p className="mt-2 text-muted-foreground">{f.a}</p></details>)}</div>}
            <AskForm token={token} v={v!} initial={(b.questions ?? []).map(({ id, at, q, a }) => ({ id, at, q, a }))} />
          </Section>
          <Section id="next" n={at("next")} title="Next steps">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border p-5"><h3 className="font-semibold">Talk to an advisor</h3><p className="mt-1 text-sm text-muted-foreground">Walk through the numbers, the seller and deal structure.</p>{bookingUrl ? <a id="room-book" href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-primary mt-4 w-full"><CalendarDays size={17} /> Book a call</a> : <Link href={`/access/${token}?v=${encodeURIComponent(v!)}`} className="btn btn-primary mt-4 w-full"><CalendarDays size={17} /> Request a call</Link>}</div>
              <div className="rounded-xl border p-5"><h3 className="font-semibold">Ready to move?</h3><p className="mt-1 text-sm text-muted-foreground">Share a non-binding indication of interest. It goes straight to the advisor.</p></div>
            </div>
            <div className="mt-3 rounded-xl border p-5"><h3 className="mb-4 font-semibold">Indication of interest</h3><InterestForm token={token} v={v!} ask={l.askUsd} /></div>
          </Section>
        </main>
      </div>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">Confidential. Shared with {b.email} under the NDA signed {b.nda?.signedAt.slice(0, 10)}. Do not forward.</footer>
    </div>
  );
}
