import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { Market } from "@/components/market";
import { BuySteps } from "@/components/buy-steps";
import { DealAlerts } from "@/components/deal-alerts";
import { SoldWall } from "@/components/sold-wall";
import { compact } from "@/content/listings";
import { soldDeals } from "@/content/site";
import { publicListings, soldListings } from "@/lib/catalog";
export const metadata: Metadata = { title: "Businesses for sale", description: "Profitable online and tech-enabled businesses, professionally prepared for sale. Sign the NDA on your phone and open a private deal room." };
export const revalidate = 60;
export default async function Buy() {
  const [list, sold] = await Promise.all([publicListings(), soldListings()]);
  const live = list.filter((l) => l.status !== "pending");
  const total = live.reduce((s, l) => s + (l.askUsd ?? 0), 0);
  const cats = [...new Set(list.map((l) => l.category))];
  return <>
    <PageHead eyebrow="Buy a business" title="Acquisition opportunities, professionally prepared for sale." lede="Screen the public teaser, sign the NDA in one tap and open a private deal room. Need funding? We work with over 230 acquisition financing strategies." stats={[[String(live.length), "Businesses open to offers"], [compact(total), "Combined asking price"], [String(cats.length), "Sectors represented"], [String(sold.length + soldDeals.length), "Closed deals on record"]]} />
    <section className="wrap py-10 md:py-14"><Market listings={list} /></section>
    <BuySteps />
    <DealAlerts categories={[...new Set([...cats, ...soldDeals.map(([, c]) => c)])].slice(0, 12)} />
    <SoldWall />
  </>;
}
