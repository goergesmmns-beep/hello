import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Empty, PageTitle } from "@/components/desk/panel";
import { categoryIcon } from "@/components/listing-card";
import { buyerStage, lane, lanes } from "@/components/portal/deal-stage";
import { progress } from "@/components/account/deal-card";
import { catalog } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
export const metadata = { title: "My deals" };
const steps = ["Request", "NDA", "Funding", "Review", "Deal room", "Call"];
export default async function Deals() {
  const u = await me("/buyer/deals"); const [deals, cat] = await Promise.all([myDeals(u), catalog()]);
  return <><PageTitle title="My deals" sub="Every business you have requested, grouped by who has the next move."><Link href="/buyer/listings" className="tbtn">Marketplace</Link></PageTitle>
    {deals.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{lanes.map(([k, name]) => { const rows = deals.filter((d) => lane(d) === k); return <section key={k} aria-label={name} className="panel"><div className="panel-head"><span className="flex-1 text-[15px] font-semibold">{name}</span><span className="num rounded-md border bg-surface-1 px-2 text-xs leading-5">{rows.length}</span></div><div className="well !p-2.5 space-y-2.5 min-h-[120px]">
      {rows.length ? rows.map((d) => { const l = cat.find((x) => x.slug === d.listingSlug); const s = buyerStage(d); const p = progress(d); const I = categoryIcon(l?.category ?? ""); return <Link key={d.id} href={`/buyer/deals/${d.id}`} data-deal={d.listingSlug} className="block rounded-xl border bg-surface-1 p-3.5 transition-colors hover:border-c-orange/60">
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><I size={13} />{l?.category}<span className="ml-auto">{new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></p>
        <p className="mt-1.5 line-clamp-2 text-[14.5px] font-semibold leading-snug">{l?.title ?? d.listingSlug}</p>
        <div className="mt-3 flex gap-1" aria-label={`Step ${p + 1} of ${steps.length}`}>{steps.map((x, i) => <span key={x} className={`h-1 flex-1 rounded-full ${i < p ? "bg-c-green" : i === p ? "bg-c-orange" : "bg-muted"}`} />)}</div>
        <p className="mt-3 flex items-center justify-between gap-2 text-[13px]"><span className="flex items-center gap-1.5"><i className="block size-1.5 rounded-full" style={{ background: s.tone }} />{s.label}</span>{s.mine ? <ArrowRight size={14} className="text-c-orange" /> : d.nda ? <Check size={14} className="text-c-green" /> : null}</p>
      </Link>; }) : <p className="grid h-[100px] place-items-center text-center text-sm text-muted-foreground">Nothing here</p>}
    </div></section>; })}</div> : <Empty title="No deals yet" text="Open a listing in the marketplace and tap Request access. Your NDA, funding check and deal room all live here." />}</>;
}
