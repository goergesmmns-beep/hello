import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { BuyList } from "@/components/buy-list";
import { SoldWall } from "@/components/sold-wall";
export const metadata: Metadata = { title: "Businesses for sale" };
export default function Buy() {
  return <><PageHead eyebrow="Buy a business" title="Acquisition opportunities, professionally prepared for sale." lede="Review the public summary, sign the NDA and request the CIM. Worried about funding? Don't be. We offer access to over 230 acquisition financing strategies." /><section className="wrap py-14 md:py-20"><BuyList /></section><SoldWall /></>;
}
