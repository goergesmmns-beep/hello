import Link from "next/link";
import { Handshake, MessagesSquare } from "lucide-react";
import { Empty, PageTitle } from "@/components/desk/panel";
import { money } from "@/content/listings";
import { me } from "@/lib/my";
import { alias, sellerCtx } from "@/lib/seller-portal";
export const metadata = { title: "Offers" };
const tone: Record<string, string> = { Submitted: "var(--c-blue)", Countered: "var(--c-purple)", Accepted: "var(--c-green)", Declined: "var(--c-gray)", Withdrawn: "var(--c-gray)", Draft: "var(--c-gray)" };
export default async function Offers() {
  const u = await me("/seller/offers"); const { offers, cur, listing } = await sellerCtx(u);
  const ask = cur?.sale.asking ?? listing?.askUsd ?? 0; const rows = [...offers].filter((o) => o.status !== "Draft").sort((a, b) => b.amountUsd - a.amountUsd);
  return <><PageTitle title="Offers" sub="Every offer side by side. Your advisor walks you through each one before you answer."><Link href="/seller/messages" className="tbtn"><MessagesSquare size={15} />Talk it through</Link></PageTitle>
    {rows.length ? <div className="grid gap-5 lg:grid-cols-2">{rows.map((o, i) => { const parts: [string, number, string][] = [["Cash at close", o.cashUsd ?? (o.sellerNoteUsd || o.earnoutUsd ? 0 : o.amountUsd), "var(--c-green)"], ["Seller note", o.sellerNoteUsd ?? 0, "var(--c-blue)"], ["Earnout", o.earnoutUsd ?? 0, "var(--c-purple)"]]; const total = Math.max(1, parts.reduce((s, [, n]) => s + n, 0)); return <article key={o.id} className="panel"><div className="panel-head"><Handshake size={17} className="text-muted-foreground" /><span className="flex-1 font-semibold">{alias(o.buyer)}{i === 0 && rows.length > 1 && <span className="ml-2 rounded-md bg-c-orange/15 px-1.5 py-0.5 text-xs font-medium text-c-orange">Highest</span>}</span><span className="flex items-center gap-1.5 rounded-full border bg-surface-2 px-2.5 py-0.5 text-xs"><i className="size-1.5 rounded-full" style={{ background: tone[o.status] }} />{o.status}</span></div><div className="well">
      <p className="num text-[32px] font-semibold leading-none">{money(o.amountUsd)}</p><p className="mt-1.5 text-sm text-muted-foreground">{ask ? `${Math.round((o.amountUsd / ask) * 100)}% of asking` : "No asking price set"} · {new Date(o.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-muted">{parts.filter(([, n]) => n > 0).map(([k, n, c]) => <i key={k} className="block h-full" style={{ width: `${(n / total) * 100}%`, background: c }} />)}</div>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">{parts.map(([k, n, c]) => <div key={k} className="legend" style={{ ["--c" as string]: c }}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="num font-medium">{n ? money(n) : "–"}</dd></div>)}</dl>
    </div></article>; })}</div> : <Empty title="No offers yet" text="Offers appear here as buyers make them, with cash at close, seller note and earnout broken out." />}</>;
}
