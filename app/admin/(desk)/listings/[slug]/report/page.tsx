import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/desk/actions";
import { Funnel } from "@/components/desk/charts";
import { Card, PageTitle } from "@/components/desk/shell";
import { money } from "@/content/listings";
import { findListing } from "@/lib/catalog";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
const live = ["Submitted", "Countered", "Accepted"];
/** For the seller. Shows counts and offer terms only, never buyer names. */
export default async function SellerReport({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const l = await findListing((await params).slug);
  if (!l) notFound();
  const b = (await allBuyers()).filter((x) => x.listingSlug === l.slug && !x.archived);
  const did = (x: typeof b[number], t: string) => x.events.some((e) => e.type === t);
  const steps = [{ label: "Inquiries", value: b.length }, { label: "NDAs signed", value: b.filter((x) => x.nda).length }, { label: "Funds verified", value: b.filter((x) => x.funds?.status === "verified").length }, { label: "CIMs released", value: b.filter((x) => did(x, "cim")).length }, { label: "CIMs opened", value: b.filter((x) => x.cimViews > 0).length }, { label: "Calls", value: b.filter((x) => did(x, "call")).length }];
  const offers = b.flatMap((x) => x.offers ?? []).sort((a, c) => c.amountUsd - a.amountUsd);
  const week = (n: number) => { const end = Date.now() - n * 7 * 864e5; return b.filter((x) => { const t = new Date(x.createdAt).getTime(); return t <= end && t > end - 7 * 864e5; }).length; };
  return (<><PageTitle title="Seller report" sub={`${l.title} · ${new Date().toISOString().slice(0, 10)}`}><PrintButton /></PageTitle>
    <p className="mb-3 text-sm text-muted-foreground">Buyer names are left out. This page is safe to share with the seller.</p>
    <div className="grid gap-3 lg:grid-cols-2">
      <Card title="Buyer activity"><Funnel steps={steps} /></Card>
      <Card title="Last four weeks" sub="New inquiries"><ul>{[0, 1, 2, 3].map((n) => <li key={n} className="flex justify-between border-b py-2.5 text-sm last:border-0"><span>{n === 0 ? "This week" : `${n} ${n === 1 ? "week" : "weeks"} ago`}</span><span className="num font-medium">{week(n)}</span></li>)}</ul></Card>
      <Card title="Offers" sub={l.askUsd ? `Asking ${money(l.askUsd)}` : undefined} className="lg:col-span-2">{offers.length ? <ul>{offers.map((o, i) => <li key={o.id} className="flex flex-wrap justify-between gap-3 border-b py-2.5 text-sm last:border-0"><span>Offer {String.fromCharCode(65 + (i % 26))} · {o.status}</span><span className="num font-medium">{money(o.amountUsd)}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No offers yet.</p>}<p className="mt-3 text-sm text-muted-foreground">{offers.filter((o) => live.includes(o.status)).length} live.</p></Card>
    </div></>);
}
