import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { Empty, PageTitle } from "@/components/desk/shell";
import { money } from "@/content/listings";
import { ago } from "@/lib/analytics";
import { catalog } from "@/lib/catalog";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
const groups = [["submitted", "Waiting for review"], ["more", "Waiting on the buyer"], ["verified", "Verified"], ["declined", "Not sufficient"]] as const;
export default async function FundsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, cat] = await Promise.all([allBuyers(), catalog()]);
  const rows = all.filter((b) => b.funds?.status && !b.archived); const now = new Date().toISOString();
  return (<><PageTitle title="Proof of funds" sub="Documents stay on this site, never in the CRM. Files are deleted after 30 days. The verified amount stays." />
    {rows.length ? <div className="space-y-5">{groups.map(([k, label]) => { const g = rows.filter((b) => b.funds!.status === k).sort((a, b) => (a.funds!.submittedAt ?? "").localeCompare(b.funds!.submittedAt ?? "")); return g.length > 0 && <section key={k}><h2 className="mb-2 text-sm font-semibold">{label} <span className="num text-muted-foreground">{g.length}</span></h2><div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[700px] text-sm"><thead className="bg-muted/50 text-left text-[13px] text-muted-foreground"><tr>{["Buyer", "Listing", "Document", "Amount", k === "verified" ? "Valid until" : "Waiting"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{g.map((b) => { const f = b.funds!; const old = !!f.expiresAt && f.expiresAt < now; return <tr key={b.id} className="border-t"><td className="px-4 py-3"><Link href={`/admin/buyers/${b.id}`} className="font-semibold hover:text-brand">{b.name}</Link></td><td className="px-4 py-3 text-muted-foreground">{cat.find((l) => l.slug === b.listingSlug)?.title}</td><td className="px-4 py-3">{f.docType} · {f.docs.length} {f.docs.length === 1 ? "file" : "files"}</td><td className="num px-4 py-3">{f.verifiedUsd ? money(f.verifiedUsd) : f.statedUsd ? money(f.statedUsd) : "Not stated"}</td><td className={`num px-4 py-3 ${old ? "text-destructive" : "text-muted-foreground"}`}>{k === "verified" ? `${f.expiresAt?.slice(0, 10)}${old ? " expired" : ""}` : f.submittedAt ? ago(f.submittedAt) : ""}</td></tr>; })}</tbody></table></div></section>; })}</div> : <Empty title="No proof of funds yet" text="Documents appear here when a buyer sends them." />}</>);
}
