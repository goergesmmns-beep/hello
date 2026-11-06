import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/desk/shell";
import type { Note } from "@/components/desk/notifications";
import { isAdmin } from "@/lib/admin";
import { launchChecks } from "@/lib/launch";
import { allSubs } from "@/lib/seller";
import { catalog } from "@/lib/catalog";
import { allBuyers, allSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";
export default async function Desk({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const [all, s, cat, jar, checks, sl] = await Promise.all([allBuyers(), allSubmissions(), catalog(), cookies(), launchChecks(), allSubs()]);
  const b = all.filter((x) => !x.archived); const today = new Date().toISOString().slice(0, 10);
  const title = (slug: string) => cat.find((l) => l.slug === slug)?.title ?? slug;
  const notes: Note[] = [
    ...b.filter((x) => x.stage === "review").map((x) => ({ id: `r${x.id}`, kind: "review" as const, title: `${x.name} is ready for review`, sub: title(x.listingSlug), at: x.updatedAt, href: `/admin/buyers/${x.id}` })),
    ...b.filter((x) => x.funds?.status === "submitted").map((x) => ({ id: `f${x.id}`, kind: "funds" as const, title: `Proof of funds from ${x.name}`, sub: `${x.funds!.docs.length} ${x.funds!.docs.length === 1 ? "document" : "documents"} · ${title(x.listingSlug)}`, at: x.funds!.submittedAt ?? x.updatedAt, href: `/admin/buyers/${x.id}` })),
    ...b.flatMap((x) => (x.questions ?? []).filter((q) => !q.a).map((q) => ({ id: `q${q.id}`, kind: "question" as const, title: `${x.name} asked a question`, sub: q.q, at: q.at, href: `/admin/buyers/${x.id}` }))),
    ...b.flatMap((x) => (x.offers ?? []).filter((o) => o.status === "Submitted").map((o) => ({ id: `o${o.id}`, kind: "offer" as const, title: `Offer from ${x.name}: $${o.amountUsd.toLocaleString("en-US")}`, sub: title(x.listingSlug), at: o.at, href: `/admin/buyers/${x.id}` }))),
    ...b.flatMap((x) => (x.tasks ?? []).filter((t) => !t.done && t.due && t.due <= today).map((t) => ({ id: `t${t.id}`, kind: "task" as const, title: `Due: ${t.text}`, sub: x.name, at: `${t.due}T00:00:00.000Z`, href: "/admin/tasks" }))),
    ...s.filter((x) => !x.handled).map((x) => ({ id: `i${x.id}`, kind: "inbox" as const, title: `New ${x.kind.toLowerCase()} message`, sub: x.fields.name || x.fields.email || "", at: x.createdAt, href: "/admin/inbox" })),
    ...sl.filter((x) => x.status === "submitted").map((x) => ({ id: `s${x.id}`, kind: "inbox" as const, title: `Business submitted: ${x.business.publicTitle ?? x.business.name}`, sub: x.ownerName, at: x.submittedAt ?? x.updatedAt, href: `/admin/submissions/${x.id}` })),
  ].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 30);
  return <Shell subs={sl.filter((x) => x.status === "submitted").length} ready={[checks.filter((c) => c[1]).length, checks.length]} open={jar.get("sidebar_state")?.value !== "false"} email={process.env.ADVISOR_EMAIL?.split(",")[0] || "advisor@westboundroad.com"} notes={notes} review={b.filter((x) => x.stage === "review").length} inbox={s.filter((x) => !x.handled).length} funds={b.filter((x) => x.funds?.status === "submitted").length} tasks={b.flatMap((x) => x.tasks ?? []).filter((t) => !t.done && t.due && t.due <= today).length}>{children}</Shell>;
}
