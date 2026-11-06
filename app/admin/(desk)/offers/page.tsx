import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { OfferStatusSelect } from "@/components/desk/actions";
import { Card, Empty, PageTitle } from "@/components/desk/shell";
import { money } from "@/content/listings";
import { catalog } from "@/lib/catalog";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
const live = ["Submitted", "Countered", "Accepted"];
export default async function OffersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, cat] = await Promise.all([allBuyers(), catalog()]);
  const rows = all.flatMap((b) => (b.offers ?? []).map((o) => ({ ...o, buyerId: b.id, name: b.name, slug: b.listingSlug })));
  const slugs = [...new Set(rows.map((r) => r.slug))];
  return (<><PageTitle title="Offers" sub="Every LOI and offer, grouped by listing. Log them on the buyer record." />
    {rows.length ? <div className="space-y-3">{slugs.map((s) => { const r = rows.filter((x) => x.slug === s).sort((a, b) => b.amountUsd - a.amountUsd); const on = r.filter((x) => live.includes(x.status)); const l = cat.find((x) => x.slug === s); return <Card key={s} title={l?.title ?? s} sub={l?.askUsd ? `Asking ${money(l.askUsd)}` : undefined} action={<span className="text-sm text-muted-foreground">{on.length} live{on[0] ? <> · highest <span className="num text-foreground">{money(on[0].amountUsd)}</span></> : ""}</span>}><ul>{r.map((o) => <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-2.5 last:border-0"><div className="min-w-0"><Link href={`/admin/buyers/${o.buyerId}`} className="font-semibold hover:text-brand">{o.name}</Link><p className="text-xs text-muted-foreground">{[o.cashUsd && `${money(o.cashUsd)} cash`, o.sellerNoteUsd && `${money(o.sellerNoteUsd)} seller note`, o.earnoutUsd && `${money(o.earnoutUsd)} earnout`].filter(Boolean).join(" · ") || "No terms logged"} · {o.at.slice(0, 10)}</p></div><div className="flex items-center gap-3"><span className="num font-medium">{money(o.amountUsd)}</span><OfferStatusSelect id={o.buyerId} offerId={o.id} status={o.status} /></div></li>)}</ul></Card>; })}</div> : <Empty title="No offers yet" text="Open a buyer and choose Log an offer." />}</>);
}
