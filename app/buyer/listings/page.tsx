import { PageTitle } from "@/components/desk/panel";
import { BuyerMarket } from "@/components/portal/buyer-market";
import { buyerStage } from "@/components/portal/deal-stage";
import { publicListings } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
export const metadata = { title: "Marketplace" };
export default async function Market() {
  const u = await me("/buyer/listings"); const [list, deals] = await Promise.all([publicListings(), myDeals(u)]);
  const tags = Object.fromEntries(deals.map((d) => [d.listingSlug, buyerStage(d).label]));
  return <><PageTitle title="Marketplace" sub="Every business we have prepared for sale. Open one to see the details and request access." /><BuyerMarket listings={list} saved={u.saved} hidden={u.hidden ?? []} deals={tags} /></>;
}
