import Link from "next/link";
import { DealCard } from "@/components/account/deal-card";
import { Empty, PageTitle } from "@/components/desk/panel";
import { catalog } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
export default async function Deals() {
  const u = await me(); const [deals, cat] = await Promise.all([myDeals(u), catalog()]);
  return <><PageTitle title="My deals" sub="Every business you have requested, with where it stands."><Link href="/buy" className="tbtn">Browse listings</Link></PageTitle>
    {deals.length ? <div className="grid gap-4 lg:grid-cols-2">{deals.map((d) => <DealCard key={d.id} b={d} l={cat.find((l) => l.slug === d.listingSlug)} />)}</div> : <Empty title="No deals yet" text="Request a listing to start. Your NDA, deal room and documents will appear here." />}</>;
}
