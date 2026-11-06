import { Empty, PageTitle } from "@/components/desk/panel";
import { catalog } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
export default async function Ndas() {
  const u = await me(); const [deals, cat] = await Promise.all([myDeals(u), catalog()]); const rows = deals.filter((d) => d.nda);
  return <><PageTitle title="Signed NDAs" sub="Your signed copies, with the record of each signature." />
    {rows.length ? <div className="tablebox !m-0 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="bg-surface-1 text-left text-[13px] text-muted-foreground"><tr>{["Listing", "Signed", "Method", "", ""].map((h, i) => <th key={i} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map((d) => <tr key={d.id} className="border-t"><td className="px-4 py-3 font-medium">{cat.find((l) => l.slug === d.listingSlug)?.title}</td><td className="num px-4 py-3 text-muted-foreground">{d.nda!.signedAt.slice(0, 16).replace("T", " ")} UTC</td><td className="px-4 py-3 capitalize">{d.nda!.method ?? "typed"}</td><td className="px-4 py-3"><a className="font-medium underline-offset-4 hover:underline" target="_blank" rel="noreferrer" href={`/api/access/${d.token}/nda`}>Download PDF</a></td><td className="px-4 py-3"><a className="text-muted-foreground underline-offset-4 hover:underline" href={`/verify/${d.nda!.fileId}`}>Verify</a></td></tr>)}</tbody></table></div> : <Empty title="No NDAs yet" text="Signed NDAs appear here the moment you sign." />}</>;
}
