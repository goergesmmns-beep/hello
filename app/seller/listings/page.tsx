import { ArrowRight, Plus } from "lucide-react";
import { PageTitle } from "@/components/desk/panel";
import { categoryIcon } from "@/components/listing-card";
import { money } from "@/content/listings";
import { me } from "@/lib/my";
import { subLabels } from "@/lib/seller";
import { sellerCtx, subTitle, subTone } from "@/lib/seller-portal";
export const metadata = { title: "All businesses" };
export default async function All() {
  const u = await me("/seller/listings"); const { subs, cur, live } = await sellerCtx(u);
  return <><PageTitle title="All businesses" sub="Pick one to open its dashboard."><a href="/seller/new" className="btn btn-brand !min-h-10 !rounded-[10px] !text-[14px]"><Plus size={16} />List another business</a></PageTitle>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{subs.map((s) => { const I = categoryIcon(s.business.category ?? ""); const isLive = s === cur && live; const last = s.financials.at(-1); return <a key={s.id} href={`/seller/switch?id=${s.id}&to=/seller`} className="panel transition-transform hover:-translate-y-0.5"><div className="panel-head"><I size={17} className="text-muted-foreground" /><span className="flex-1 truncate text-[15px] font-semibold">{s.business.category || "New listing"}</span><span className="flex items-center gap-1.5 rounded-full border bg-surface-2 px-2.5 py-0.5 text-xs"><i className="size-1.5 rounded-full" style={{ background: subTone[isLive ? "live" : s.status] }} />{isLive ? "Live" : subLabels[s.status]}</span></div><div className="well"><h3 className="text-lg font-semibold leading-tight tracking-tight">{subTitle(s)}</h3><dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm"><div><dt className="text-xs text-muted-foreground">Asking</dt><dd className="num font-medium">{s.sale.asking ? money(s.sale.asking) : "Not set"}</dd></div><div><dt className="text-xs text-muted-foreground">{last ? `${last.period} revenue` : "Revenue"}</dt><dd className="num font-medium">{last ? money(last.revenue) : "Not added"}</dd></div></dl><p className="mt-4 flex items-center justify-between text-sm text-muted-foreground">Updated {s.updatedAt.slice(0, 10)}<ArrowRight size={15} /></p></div></a>; })}
      <a href="/seller/new" className="grid min-h-[200px] place-items-center rounded-2xl border border-dashed p-6 text-center text-muted-foreground transition-colors hover:border-c-orange hover:text-foreground"><span><Plus size={22} className="mx-auto" /><span className="mt-2 block font-medium">List another business</span></span></a>
    </div></>;
}
