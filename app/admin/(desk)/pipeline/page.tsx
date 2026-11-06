import Link from "next/link";
import { Decide } from "@/components/desk/actions";
import { PageTitle } from "@/components/desk/shell";
import { catalog, isOpen } from "@/lib/catalog";
import { ago, routeLabels } from "@/lib/analytics";
import { allBuyers } from "@/lib/store";
import { type Stage, stageLabels } from "@/lib/types";

export const dynamic = "force-dynamic";
const order: Stage[] = ["inquiry", "nda", "capacity", "review", "cim", "call", "warm"];
export default async function Pipeline({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams;
  const cat = await catalog();
  const buyers = (await allBuyers()).filter((b) => !b.archived && (!listing || b.listingSlug === listing));
  return (<>
    <PageTitle title="Pipeline" sub="Every active buyer, by stage." />
    <div className="mb-4 flex flex-wrap gap-2"><Link href="/admin/pipeline" className={`btn !min-h-9 !text-sm ${listing ? "btn-ghost" : "btn-brand"}`}>All listings</Link>{cat.filter(isOpen).map((l) => <Link key={l.slug} href={`/admin/pipeline?listing=${l.slug}`} className={`btn !min-h-9 !text-sm ${listing === l.slug ? "btn-brand" : "btn-ghost"}`}>{l.category}: {l.title.split(" ").slice(0, 2).join(" ")}</Link>)}</div>
    <div className="overflow-x-auto pb-3"><div className="grid min-w-[1080px] grid-cols-7 gap-2">{order.map((s) => { const r = buyers.filter((b) => b.stage === s); return <section key={s} aria-label={stageLabels[s]} className={`min-h-[60vh] rounded-xl border p-2 ${s === "review" && r.length ? "border-brand bg-brand/10" : "bg-card"}`}><h2 className="flex justify-between px-1.5 py-1 text-xs font-medium text-muted-foreground">{stageLabels[s]}<span className="num">{r.length}</span></h2><div className="mt-1 space-y-2">{r.map((b) => <article key={b.id} className="rounded-lg border bg-background p-2.5 text-sm"><Link href={`/admin/buyers/${b.id}`} className="block font-semibold hover:text-brand">{b.name}</Link><p className="mt-0.5 text-xs text-muted-foreground">{cat.find((l) => l.slug === b.listingSlug)?.title}</p><p className="mt-1.5 flex justify-between text-xs text-muted-foreground"><span>{b.route ? routeLabels[b.route] : b.source}</span><span className="num">{ago(b.updatedAt)}</span></p>{s === "review" && <div className="mt-2"><Decide id={b.id} stage={s} compact /></div>}</article>)}</div></section>; })}</div></div>
  </>);
}
