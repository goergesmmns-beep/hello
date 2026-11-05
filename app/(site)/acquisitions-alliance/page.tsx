import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
export const metadata: Metadata = { title: "Acquisitions Alliance" };
const items = ["Get your most pressing acquisition questions answered", "Bring potential deals for review", "Brainstorm deal structures and offer strategies", "Learn about creative funding options", "Have the team review your LOI before you submit it"];
export default function Alliance() {
  return (<><PageHead eyebrow="Private member group" title="Acquisitions Alliance" lede="A weekly Ask Me Anything group coaching call and mastermind hosted by the experts at Westbound Road." />
    <section className="wrap py-14 md:py-20"><ul className="border-t">{items.map((i) => <li key={i} className="border-b py-4 text-xl tracking-tight">{i}</li>)}</ul><Link href="/contact" className="btn btn-primary mt-8">Ask about joining</Link></section></>);
}
