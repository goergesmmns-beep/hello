import Link from "next/link";
import { redirect } from "next/navigation";
import { getListing } from "@/content/listings";
import { isAdmin } from "@/lib/admin";
import { allBuyers, allSubmissions } from "@/lib/store";
import { type Stage, stageLabels } from "@/lib/types";

export const dynamic = "force-dynamic";
const order: Stage[] = ["review", "inquiry", "nda", "capacity", "cim", "call", "warm"];
export default async function Desk() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [buyers, subs] = await Promise.all([allBuyers(), allSubmissions()]);
  const waiting = buyers.filter((b) => b.stage === "review").length;
  return (<>
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2"><h1 className="text-3xl font-semibold">Buyers</h1><p className="text-muted-foreground"><span className="num text-foreground">{waiting}</span> waiting for review · <Link className="underline" href="/admin/integrations">Pipedrive connection</Link></p></div>
    <div className="overflow-x-auto"><div className="grid min-w-[1000px] grid-cols-7 gap-2">{order.map((s) => <section key={s} className={`min-h-64 rounded-md border p-2 ${s === "review" ? "border-brand bg-brand/10" : "bg-muted"}`}><h2 className="eyebrow mb-2 !text-[11px]">{stageLabels[s]}</h2><div className="space-y-1.5">{buyers.filter((b) => b.stage === s).map((b) => <Link key={b.id} href={`/admin/buyers/${b.id}`} className="block rounded border bg-background p-2 text-sm hover:border-foreground"><b className="block font-semibold">{b.name}</b><span className="block text-xs text-muted-foreground">{getListing(b.listingSlug)?.title}</span><span className="mt-1 block text-xs text-muted-foreground">{b.source}{b.route ? ` · ${b.route}` : ""}</span></Link>)}</div></section>)}</div></div>
    <h2 className="mb-3 mt-10 text-2xl font-semibold">Form submissions</h2>
    {subs.length ? <ul className="border-t">{subs.map((s) => <li key={s.id} className="border-b py-3 text-sm"><b>{s.kind}</b> · {s.fields.name} · {s.fields.email}</li>)}</ul> : <p className="text-muted-foreground">No submissions yet.</p>}
  </>);
}
