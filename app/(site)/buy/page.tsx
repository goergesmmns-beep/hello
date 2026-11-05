import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { BuyList } from "@/components/buy-list";
export const metadata: Metadata = { title: "Businesses for sale" };
export default function Buy() {
  return <><PageHead eyebrow="Buy a business" title="Curated businesses, professionally prepared for sale." lede="Worried about funding? Don't be. We offer access to over 230 acquisition financing strategies to help you secure the right deal." /><section className="wrap py-14 md:py-20"><BuyList /></section></>;
}
