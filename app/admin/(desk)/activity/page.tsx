import Link from "next/link";
import { Empty, PageTitle } from "@/components/desk/shell";
import { catalog } from "@/lib/catalog";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function ActivityPage() {
  const cat = await catalog();
  const rows = (await allBuyers()).flatMap((b) => b.events.map((e) => ({ ...e, id: b.id, name: b.name, listing: cat.find((l) => l.slug === b.listingSlug)?.title }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 300);
  return (<><PageTitle title="Activity" sub="The latest 300 events, newest first. Times are UTC." />{rows.length ? <ol className="overflow-hidden rounded-xl border">{rows.map((e, i) => <li key={i} className="grid gap-x-4 border-b p-3 text-sm last:border-0 md:grid-cols-[140px_180px_1fr]"><span className="num text-xs leading-5 text-muted-foreground">{e.at.slice(0, 16).replace("T", " ")}</span><Link href={`/admin/buyers/${e.id}`} className="font-medium hover:text-brand">{e.name}</Link><span className={e.type.endsWith("_error") ? "text-destructive" : "text-muted-foreground"}>{e.detail} · {e.listing}</span></li>)}</ol> : <Empty title="No activity yet" text="Events appear after your first inquiry." />}</>);
}
