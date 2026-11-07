import { PipelineBoard, type PCard } from "@/components/desk/pipeline-board";
import { catalog } from "@/lib/catalog";
import { routeLabels } from "@/lib/analytics";
import { columnOf, getStages } from "@/lib/pipeline";
import { allBuyers } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pipeline" };
/** Since the buyer entered their current column. */
const since = (b: { events: { at: string; type: string }[]; createdAt: string }, types: string[]) => b.events.find((e) => types.includes(e.type))?.at ?? b.createdAt;
const entered: Record<string, string[]> = { inquiry: ["inquiry"], nda: ["nda"], capacity: ["nda", "funds", "funds_more"], review: ["review", "funds"], cim: ["cim"], call: ["call"], warm: ["warm"] };

export default async function Pipeline() {
  const [stages, buyers, cat] = await Promise.all([getStages(), allBuyers(), catalog()]);
  const cards: PCard[] = buyers.filter((b) => !b.archived).map((b) => {
    const l = cat.find((x) => x.slug === b.listingSlug); const col = columnOf(b, stages);
    const best = (b.offers ?? []).filter((o) => o.status !== "Withdrawn" && o.status !== "Declined").sort((x, y) => y.amountUsd - x.amountUsd)[0];
    return {
      id: b.id, name: b.name, company: b.company, col, rank: b.rank ?? 9999, updatedAt: b.updatedAt,
      listing: l?.title ?? b.listingSlug, slug: b.listingSlug, category: l?.category ?? "", ask: l?.askUsd ?? null,
      route: b.route ? routeLabels[b.route] : undefined, routeKey: b.route, source: b.source,
      nda: !!b.nda, funds: b.funds?.status === "verified" ? { s: "ok" as const, usd: b.funds.verifiedUsd } : b.funds?.status === "submitted" ? { s: "wait" as const } : b.funds?.status === "more" ? { s: "more" as const } : undefined,
      offer: best ? { usd: best.amountUsd, status: best.status } : undefined,
      since: b.board ? since(b, ["board"]) : since(b, entered[b.stage] ?? []),
      tasks: (b.tasks ?? []).filter((t) => !t.done).length, overdue: (b.tasks ?? []).some((t) => !t.done && t.due && t.due < new Date().toISOString().slice(0, 10)),
      questions: (b.questions ?? []).filter((q) => !q.a).length, views: b.cimViews,
    };
  }).sort((a, b) => a.rank - b.rank || b.updatedAt.localeCompare(a.updatedAt));
  const listings = cat.filter((l) => cards.some((c) => c.slug === l.slug)).map((l) => ({ slug: l.slug, title: l.title }));
  return <PipelineBoard stages={stages} cards={cards} listings={listings} />;
}
