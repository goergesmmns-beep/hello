import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { TaskCheck } from "@/components/desk/actions";
import { Card, Empty, PageTitle } from "@/components/desk/shell";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function TasksPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const all = await allBuyers(); const today = new Date().toISOString().slice(0, 10);
  const rows = all.filter((b) => !b.archived).flatMap((b) => (b.tasks ?? []).filter((t) => !t.done).map((t) => ({ ...t, buyerId: b.id, name: b.name }))).sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"));
  const groups: [string, typeof rows][] = [["Overdue", rows.filter((t) => t.due && t.due < today)], ["Today", rows.filter((t) => t.due === today)], ["Upcoming", rows.filter((t) => t.due && t.due > today)], ["No date", rows.filter((t) => !t.due)]];
  return (<><PageTitle title="Tasks" sub="Follow-ups across every buyer. Add them on the buyer record." />
    {rows.length ? <div className="grid gap-3 lg:grid-cols-2">{groups.filter(([, g]) => g.length).map(([t, g]) => <Card key={t} title={t}><ul className="space-y-2.5">{g.map((x) => <li key={x.id} className="flex items-start justify-between gap-3"><div className="min-w-0"><TaskCheck id={x.buyerId} taskId={x.id} done={x.done} text={x.text} /><Link href={`/admin/buyers/${x.buyerId}`} className="ml-6 text-xs text-muted-foreground hover:text-foreground">{x.name}</Link></div>{x.due && <span className="num shrink-0 text-xs text-muted-foreground">{x.due}</span>}</li>)}</ul></Card>)}</div> : <Empty title="No open tasks" text="Open a buyer and add a follow-up." />}</>);
}
