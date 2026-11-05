import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
import { GrowCompare } from "@/components/grow-compare";
export const metadata: Metadata = { title: "Grow through acquisition" };
const why = [["Expand market share", "Buy a competitor, vendor or strategic partner."], ["Boost profitability", "Add profitable revenue you do not have to build from zero."], ["Bring in talent", "Acquire a team that already knows the work."], ["Increase enterprise value", "Grow what your own business is worth."]];
export default function Grow() {
  return (<>
    <PageHead eyebrow="Buy-side advisory" title="Growth through acquisition, with advisors who have done it." lede="We help you decide if an acquisition is right, when to act and how to structure the deal. Add $1M, $5M or even $20M in profitable revenue." />
    <section className="wrap py-16 md:py-24"><h2 className="h2 mb-8 max-w-3xl">Organic growth or acquisition?</h2><GrowCompare /></section>
    <section className="border-t"><div className="wrap grid gap-px py-16 md:grid-cols-4 md:py-20">{why.map(([h, t]) => <article key={h} className="p-1 pb-6 md:pr-6"><h3 className="text-xl font-semibold tracking-tight">{h}</h3><p className="mt-2 text-muted-foreground">{t}</p></article>)}</div></section>
    <Cta title="You don't need a pile of cash." text="We have over 230 creative funding strategies that can help you acquire without draining your reserves." href="/contact" label="Get a strategy session" />
  </>);
}
