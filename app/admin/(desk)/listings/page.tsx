import Link from "next/link";
import { RuleForm } from "@/components/desk/listing-rules";
import { Card, PageTitle } from "@/components/desk/shell";
import { statusLabel } from "@/content/listings";
import { analyze } from "@/lib/analytics";
import { catalog } from "@/lib/catalog";
import { allRules } from "@/lib/rules";
import { allBuyers, allSubmissions } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function Listings() {
  const [b, s, rules, cat] = await Promise.all([allBuyers(), allSubmissions(), allRules(), catalog()]);
  const rows = analyze(b, s, cat).byListing;
  return (<><PageTitle title="Listings" sub="Add, edit and publish listings. Changes reach the public site within a minute."><Link id="add-listing" href="/admin/listings/new" className="btn btn-brand !min-h-10">Add listing</Link></PageTitle>
    <div className="space-y-3">{rows.map(({ listing: l, inquiries, ndas, cims, calls }) => { const r = rules[l.slug] ?? { gate: l.gate, floorUsd: l.floorUsd }; return <Card key={l.slug}><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px_auto] xl:items-center"><div className="min-w-0"><Link href={`/admin/listings/${l.slug}/edit`} className="font-semibold hover:text-brand">{l.title}</Link><p className="text-sm text-muted-foreground">{l.askLabel} · {statusLabel[l.status]} · <Link className="underline" href={`/admin/listings/${l.slug}/edit`}>Edit</Link></p></div><dl className="grid grid-cols-4 gap-2 text-center">{[["Inquiries", inquiries], ["NDAs", ndas], ["CIMs", cims], ["Calls", calls]].map(([k, v]) => <div key={k}><dd className="num text-xl font-medium">{v}</dd><dt className="text-xs text-muted-foreground">{k}</dt></div>)}</dl><RuleForm slug={l.slug} gate={r.gate} floor={r.floorUsd} /></div></Card>; })}</div></>);
}
