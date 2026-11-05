import { BuyersTable } from "@/components/desk/buyers-table";
import { PageTitle } from "@/components/desk/shell";
import { getListing, listings } from "@/content/listings";
import { ago, routeLabels } from "@/lib/analytics";
import { allBuyers } from "@/lib/store";
import { stageLabels } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function Buyers() {
  const rows = (await allBuyers()).map((b) => ({ id: b.id, name: b.name, email: b.email, listing: getListing(b.listingSlug)?.title ?? b.listingSlug, stage: b.stage, stageLabel: stageLabels[b.stage], route: b.route ? routeLabels[b.route] : "Not chosen", source: b.source, updatedAt: b.updatedAt, age: ago(b.updatedAt), archived: !!b.archived }));
  return <><PageTitle title="Buyers" sub="Search, filter and export your buyer database." /><BuyersTable rows={rows} stages={Object.entries(stageLabels)} listings={listings.map((l) => l.title)} /></>;
}
