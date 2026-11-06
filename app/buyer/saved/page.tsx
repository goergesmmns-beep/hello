import Link from "next/link";
import { Empty, PageTitle } from "@/components/desk/panel";
import { ListingTile } from "@/components/portal/listing-tile";
import { buyerStage } from "@/components/portal/deal-stage";
import { publicListings } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
export const metadata = { title: "Saved" };
export default async function Saved() {
  const u = await me("/buyer/saved"); const [all, deals] = await Promise.all([publicListings(), myDeals(u)]); const list = u.saved.map((s) => all.find((l) => l.slug === s)).filter((l) => !!l);
  return <><PageTitle title="Saved" sub="Businesses you are watching. Tap the bookmark to remove one."><Link href="/buyer/listings" className="tbtn">Marketplace</Link></PageTitle>
    {list.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{list.map((l) => { const d = deals.find((x) => x.listingSlug === l.slug); return <ListingTile key={l.slug} l={l} saved deal={d ? buyerStage(d).label : undefined} />; })}</div> : <Empty title="Nothing saved yet" text="Tap the bookmark on any listing in the marketplace to keep it here." />}</>;
}
