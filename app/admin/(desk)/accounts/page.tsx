import { Empty, PageTitle } from "@/components/desk/panel";
import { allUsers } from "@/lib/accounts";
import { allSubs } from "@/lib/seller";
import { allBuyers } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function Accounts() {
  const [users, buyers, subs] = await Promise.all([allUsers(), allBuyers(), allSubs()]);
  return <><PageTitle title="Accounts" sub={`${users.length} people have created an account.`} />
    {users.length ? <div className="tablebox !m-0 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-surface-1 text-left text-[13px] text-muted-foreground"><tr>{["Person", "Roles", "Buyer type", "Budget", "Deals", "Listings", "Last sign-in"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{users.sort((a, b) => (b.lastLoginAt ?? "").localeCompare(a.lastLoginAt ?? "")).map((u) => <tr key={u.id} className="border-t"><td className="px-4 py-3"><b className="block">{u.name}</b><span className="text-xs text-muted-foreground">{u.email}{u.company ? ` · ${u.company}` : ""}</span></td><td className="px-4 py-3 capitalize">{u.roles.join(", ") || "–"}</td><td className="px-4 py-3 capitalize text-muted-foreground">{u.buyer?.type ?? "–"}</td><td className="px-4 py-3 text-muted-foreground">{u.buyer?.budget ?? "–"}</td><td className="num px-4 py-3">{buyers.filter((b) => b.email.toLowerCase() === u.email).length}</td><td className="num px-4 py-3">{subs.filter((s) => s.ownerId === u.id && s.status !== "draft").length}</td><td className="num px-4 py-3 text-muted-foreground">{u.lastLoginAt?.slice(0, 10) ?? "–"}</td></tr>)}</tbody></table></div> : <Empty title="No accounts yet" text="Buyers and sellers who sign up appear here." />}</>;
}
