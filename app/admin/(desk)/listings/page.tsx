import Link from "next/link";
import { RuleForm } from "@/components/desk/listing-rules";
import { Card, PageTitle } from "@/components/desk/shell";
import { statusLabel } from "@/content/listings";
import { analyze } from "@/lib/analytics";
import { allRules } from "@/lib/rules";
import { allBuyers, allSubmissions } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function Listings() {
  const [b, s, rules] = await Promise.all([allBuyers(), allSubmissions(), allRules()]);
  const rows = analyze(b, s).byListing;
  return (<><PageTitle title="Listings" sub="Results and CIM rules for each business. Changes apply to new signers right away." />
    <div className="space-y-3">{rows.map(({ listing: l, inquiries, ndas, cims, calls }) => { const r = rules[l.slug] ?? { gate: l.gate, floorUsd: l.floorUsd }; return <Card key={l.slug}><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px_auto] xl:items-center"><div className="min-w-0"><Link href={`/buy/${l.slug}`} className="font-semibold hover:text-brand">{l.title}</Link><p className="text-sm text-muted-foreground">{l.askLabel} · {statusLabel[l.status]}</p></div><dl className="grid grid-cols-4 gap-2 text-center">{[["Inquiries", inquiries], ["NDAs", ndas], ["CIMs", cims], ["Calls", calls]].map(([k, v]) => <div key={k}><dd className="num text-xl font-medium">{v}</dd><dt className="text-xs text-muted-foreground">{k}</dt></div>)}</dl><RuleForm slug={l.slug} gate={r.gate} floor={r.floorUsd} /></div></Card>; })}</div></>);
}
