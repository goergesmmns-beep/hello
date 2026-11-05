import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
export const metadata: Metadata = { title: "Insights" };
export default function Insights() {
  return (<><PageHead eyebrow="Insights" title="What we have learned from thousands of buyers." />
    <section className="wrap py-14"><Link href="/insights/savvy-buyers" className="block border-y py-7"><p className="eyebrow mb-2">Becky Smith</p><h2 className="text-3xl font-semibold">3 quick tips and 3 telling questions for savvy buyers</h2></Link></section></>);
}
