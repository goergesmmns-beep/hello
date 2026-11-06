import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
import { Quotes, SectionHead, Tombstones } from "@/components/sections";
import { soldDeals, stats } from "@/content/site";
import { soldListings } from "@/lib/catalog";
export const metadata: Metadata = { title: "Client results" };
export default async function Success() {
  const sold = (await soldListings()).map((l) => [l.title, l.category] as const);
  return (<>
    <PageHead eyebrow="Client results" title="Founders and buyers, in their own words." lede="Exits across SaaS, eCommerce, agencies, subscription brands and more." stats={[[String(sold.length + soldDeals.length), "Closed deals on record"], ...stats.slice(0, 3).map((s) => [s.value, s.label] as [string, string])]} />
    <section className="wrap py-16 md:py-24"><SectionHead eyebrow="Testimonials" title="What clients say." /><Quotes /></section>
    <section className="border-t bg-muted/40"><div className="wrap py-16 md:py-24"><SectionHead eyebrow="Closed deals" title="Recent exits." lede="Shown the way they were marketed: by sector, never by name." /><Tombstones extra={sold} /></div></section>
    <Cta title="Your exit could be next." text="Start with a complimentary strategy session." href="/contact" label="Talk to an advisor" />
  </>);
}
