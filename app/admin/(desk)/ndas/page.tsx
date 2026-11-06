import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { Empty, PageTitle } from "@/components/desk/shell";
import { catalog } from "@/lib/catalog";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function NdasPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, cat] = await Promise.all([allBuyers(), catalog()]);
  const rows = all.filter((b) => b.nda).sort((a, b) => b.nda!.signedAt.localeCompare(a.nda!.signedAt));
  return (<><PageTitle title="NDA register" sub="Every signed NDA with its signature record. Times are UTC."><a href="/api/admin/export?type=ndas" className="btn btn-ghost !min-h-10">Export CSV</a></PageTitle>
    {rows.length ? <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[820px] text-sm"><thead className="bg-muted/50 text-left text-[13px] text-muted-foreground"><tr>{["Signed", "Signer", "Listing", "Method", "IP", "Fingerprint", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map((b) => <tr key={b.id} className="border-t"><td className="num px-4 py-3 text-muted-foreground">{b.nda!.signedAt.slice(0, 16).replace("T", " ")}</td><td className="px-4 py-3"><Link href={`/admin/buyers/${b.id}`} className="font-semibold hover:text-brand">{b.nda!.signedName}</Link></td><td className="px-4 py-3 text-muted-foreground">{cat.find((l) => l.slug === b.listingSlug)?.title}</td><td className="px-4 py-3 capitalize">{b.nda!.method ?? "typed"}</td><td className="num px-4 py-3 text-muted-foreground">{b.nda!.ip}</td><td className="num px-4 py-3 text-xs text-muted-foreground">{b.nda!.hash?.slice(0, 12) ?? "None"}</td><td className="px-4 py-3"><a target="_blank" rel="noreferrer" className="underline" href={`/api/admin/files/${b.nda!.fileId}`}>PDF</a></td></tr>)}</tbody></table></div> : <Empty title="No signed NDAs yet" text="Signed NDAs appear here." />}</>);
}
