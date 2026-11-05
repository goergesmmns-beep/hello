import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Decide } from "@/components/admin";
import { getListing, money } from "@/content/listings";
import { isAdmin } from "@/lib/admin";
import { buyerById } from "@/lib/store";
import { stageLabels } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function BuyerPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const b = await buyerById((await params).id);
  if (!b) notFound();
  const l = getListing(b.listingSlug)!;
  const c = b.capacity;
  const rows: [string, string | undefined][] = [["Email", b.email], ["Phone", b.phone], ["Company", b.company], ["LinkedIn", b.linkedin], ["Website", b.website], ["Route", b.route], ["Why this business", b.why], ["Funding plan", c?.plan], ["Role", c?.role], ["Past acquisitions", c?.acquisitions], ["Competitor", c?.competitor], ["Notes", c?.notes], ["Listing floor", l.floorUsd ? money(l.floorUsd) : undefined], ["CIM opens", String(b.cimViews)]];
  return (<>
    <Link href="/admin" className="text-sm underline">All buyers</Link>
    <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{l.title}</p><h1 className="text-4xl font-semibold">{b.name}</h1><span className="pill pill-brand mt-2">{stageLabels[b.stage]}</span></div><Decide id={b.id} stage={b.stage} /></div>
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <dl className="border-t">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid gap-1 border-b py-2.5 sm:grid-cols-[170px_1fr]"><dt className="text-sm text-muted-foreground">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>)}</dl>
      <div className="space-y-6 min-w-0"><div className="flex flex-wrap gap-2">{b.nda && <a className="btn btn-ghost" target="_blank" href={`/api/admin/files/${b.nda.fileId}`}>Signed NDA</a>}{c?.fileId && <a className="btn btn-ghost" target="_blank" href={`/api/admin/files/${c.fileId}`}>{c.fileName}</a>}</div>
        <div><h2 className="mb-2 text-xl font-semibold">Activity</h2><ol className="space-y-1.5 text-sm">{b.events.map((e, i) => <li key={i}><span className="num text-muted-foreground">{e.at.slice(0, 16).replace("T", " ")}</span> {e.detail}</li>)}</ol></div></div>
    </div></>);
}
