import { BuyersTable } from "@/components/desk/buyers-table";
import { PageTitle } from "@/components/desk/shell";
import { catalog } from "@/lib/catalog";
import { ago, readiness, routeLabels } from "@/lib/analytics";
import { allBuyers } from "@/lib/store";
import { stageLabels } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function Buyers() {
  const cat = await catalog();
  const rows = (await allBuyers()).map((b) => ({ id: b.id, name: b.name, email: b.email, listing: cat.find((l) => l.slug === b.listingSlug)?.title ?? b.listingSlug, stage: b.stage, stageLabel: stageLabels[b.stage], route: b.route ? routeLabels[b.route] : "Not chosen", source: b.source, updatedAt: b.updatedAt, age: ago(b.updatedAt), archived: !!b.archived, score: readiness(b).score }));
  return <><PageTitle title="Buyers" sub="Search, filter and export your buyer database." /><BuyersTable rows={rows} stages={Object.entries(stageLabels)} listings={cat.map((l) => l.title)} /></>;
}
