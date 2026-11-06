import Link from "next/link";
import { Empty, PageTitle } from "@/components/desk/panel";
import { ListingCard } from "@/components/listing-card";
import { publicListings } from "@/lib/catalog";
import { me } from "@/lib/my";
export default async function Saved() {
  const u = await me(); const list = (await publicListings()).filter((l) => u.saved.includes(l.slug));
  return <><PageTitle title="Saved listings" sub="Businesses you are watching."><Link href="/buy" className="tbtn">Browse listings</Link></PageTitle>
    {list.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((l) => <ListingCard key={l.slug} l={l} />)}</div> : <Empty title="Nothing saved yet" text="Tap Save on any listing to keep it here." />}</>;
}
